import { randomUUID } from 'node:crypto';
import express from 'express';
import { createContextMiddleware } from '@ctxprotocol/sdk';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  isInitializeRequest,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { startIngestionJobs } from './jobs/ingest.js';
import { flushCache } from './cache/redis.js';

import {
  analyzeDistressDefinition,
  analyzeDistressHandler,
} from './tools/intelligence/analyze-distress.js';
import type { AnalyzeDistressArgs } from './tools/intelligence/analyze-distress.js';

import {
  compareCountiesDefinition,
  compareCountiesHandler,
} from './tools/intelligence/compare-counties.js';
import type { CompareCountiesArgs } from './tools/intelligence/compare-counties.js';

import {
  findOpportunitiesDefinition,
  findOpportunitiesHandler,
} from './tools/intelligence/find-opportunities.js';
import type { FindOpportunitiesArgs } from './tools/intelligence/find-opportunities.js';

import {
  getDistressSignalsDefinition,
  getDistressSignalsHandler,
} from './tools/data/get-distress-signals.js';

import {
  getTaxDelinquenciesDefinition,
  getTaxDelinquenciesHandler,
} from './tools/data/get-tax-delinquencies.js';

import {
  getPreforeclosuresDefinition,
  getPreforeclosuresHandler,
} from './tools/data/get-preforeclosures.js';

import {
  listSupportedCountiesDefinition,
  listSupportedCountiesHandler,
} from './tools/data/list-supported-counties.js';

dotenv.config();

const app = express();
app.use(express.json());

// Session store
const transports = new Map<string, StreamableHTTPServerTransport>();

function createMcpServer(): Server {
  const server = new Server(
    { name: 'lienlens', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      analyzeDistressDefinition,
      compareCountiesDefinition,
      findOpportunitiesDefinition,
      getDistressSignalsDefinition,
      getTaxDelinquenciesDefinition,
      getPreforeclosuresDefinition,
      listSupportedCountiesDefinition,
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args } = request.params;
    const safeArgs = (args ?? {}) as Record<string, unknown>;

    switch (name) {
      case 'analyze_property_distress':
        return analyzeDistressHandler(safeArgs as unknown as AnalyzeDistressArgs);

      case 'compare_county_distress':
        return compareCountiesHandler(safeArgs as unknown as CompareCountiesArgs);

      case 'find_distress_opportunities':
        return findOpportunitiesHandler(safeArgs as unknown as FindOpportunitiesArgs);

      case 'get_distress_signals':
        return getDistressSignalsHandler(safeArgs as unknown as { countyFips: string });

      case 'get_tax_delinquencies':
        return getTaxDelinquenciesHandler(safeArgs as unknown as { countyFips: string });

      case 'get_preforeclosures':
        return getPreforeclosuresHandler(safeArgs as unknown as { countyFips: string });

      case 'list_supported_counties':
        return listSupportedCountiesHandler(safeArgs as unknown as { state?: string });

      default:
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
          isError: true,
        };
    }
  });

  return server;
}

// Context Protocol middleware for auth
app.use('/mcp', createContextMiddleware());

// POST /mcp — initiate or continue MCP session
app.post('/mcp', async (req, res) => {
  if (isInitializeRequest(req.body)) {
    const sessionId = randomUUID();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
      onsessioninitialized: (id) => {
        transports.set(id, transport);
      },
    });
    const server = createMcpServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    return;
  }

  const sessionId = req.headers['mcp-session-id'] as string;
  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  await transport.handleRequest(req, res, req.body);
});

// GET /mcp — SSE streaming
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  await transport.handleRequest(req, res);
});

// DELETE /mcp — session cleanup
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  const transport = transports.get(sessionId);
  if (transport) {
    await transport.close();
    transports.delete(sessionId);
  }
  res.status(200).json({ success: true });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lienlens', timestamp: new Date().toISOString() });
});

const PORT = parseInt(process.env.PORT ?? '3000', 10);
app.listen(PORT, async () => {
  console.log(`[LienLens] Server running on port ${PORT}`);
  await flushCache();
  console.log('[LienLens] Redis cache cleared on startup');
  startIngestionJobs();
});
