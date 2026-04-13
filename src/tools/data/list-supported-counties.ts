import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getCounties } from '../../db/queries.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';
export const listSupportedCountiesDefinition = {
  name: 'list_supported_counties',
  description:
    'List all counties supported by LienLens with metadata about data availability, record counts, and ingestion status.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      state: {
        type: 'string',
        description: 'Optional two-letter state code to filter results (e.g. "TX", "IL", "AZ")',
      },
    },
    required: [],
  },
  outputSchema: {
    type: 'object' as const,
    properties: {
      counties: { type: 'array' },
      totalCount: { type: 'number' },
      fetchedAt: { type: 'string' },
      dataSources: { type: 'array' },
      dataFreshness: { type: 'string' },
    },
  },
  _meta: {
    surface: 'both',
    queryEligible: true,
    latencyClass: 'fast',
    pricing: { executeUsd: '0.001' },
  },
};

interface ListSupportedCountiesArgs {
  state?: string;
}

export async function listSupportedCountiesHandler(
  args: ListSupportedCountiesArgs
): Promise<CallToolResult> {
  try {
    const key = cacheKey('list_supported_counties', args);
    const cached = await getCached<Record<string, unknown>>(key);
    if (cached) {
      return {
        content: [{ type: 'text', text: JSON.stringify(cached) }],
        structuredContent: cached,
      };
    }

    const counties = await getCounties(args.state);

    const result = {
      counties,
      totalCount: counties.length,
      fetchedAt: new Date().toISOString(),
      dataSources: counties.map(c => c.adapterName).filter(Boolean),
      dataFreshness: 'daily' as const,
    };

    await setCached(key, result, 300);

    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
      structuredContent: result,
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
      isError: true,
    };
  }
}
