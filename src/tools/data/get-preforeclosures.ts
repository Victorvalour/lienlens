import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getPreforeclosures } from '../../db/queries.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';

export const getPreforeclosuresDefinition = {
  name: 'get_preforeclosures',
  description:
    'Retrieve pre-foreclosure filings (lis pendens, notices of default, notices of trustee sale) for a county with optional filtering.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      countyFips: {
        type: 'string',
        description: 'Five-digit FIPS code for the county',
      },
      filingType: {
        type: 'string',
        enum: ['lis_pendens', 'notice_of_default', 'notice_of_trustee_sale', 'all'],
        description: 'Filter by filing type (default: all)',
      },
      lenderName: { type: 'string', description: 'Filter by lender name (partial match)' },
      filedAfter: { type: 'string', description: 'ISO date string — only filings on or after this date' },
      filedBefore: { type: 'string', description: 'ISO date string — only filings on or before this date' },
      page: { type: 'number', description: 'Page number (default: 1)' },
      pageSize: { type: 'number', description: 'Results per page (default: 50, max: 200)' },
    },
    required: ['countyFips'],
  },
  outputSchema: {
    type: 'object' as const,
    properties: {
      filings: { type: 'array' },
      totalCount: { type: 'number' },
      breakdownByType: { type: 'object' },
      page: { type: 'number' },
      pageSize: { type: 'number' },
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

interface GetPreforeclosuresArgs {
  countyFips: string;
  filingType?: string;
  lenderName?: string;
  filedAfter?: string;
  filedBefore?: string;
  page?: number;
  pageSize?: number;
}

export async function getPreforeclosuresHandler(
  args: GetPreforeclosuresArgs
): Promise<CallToolResult> {
  try {
    const pageSize = Math.min(args.pageSize ?? 50, 200);
    const page = args.page ?? 1;

    const key = cacheKey('get_preforeclosures', args);
    const cached = await getCached<Record<string, unknown>>(key);
    if (cached) {
      return {
        content: [{ type: 'text', text: JSON.stringify(cached) }],
        structuredContent: cached,
      };
    }

    const { filings, totalCount } = await getPreforeclosures(args.countyFips, {
      filingType: args.filingType,
      lenderName: args.lenderName,
      filedAfter: args.filedAfter,
      filedBefore: args.filedBefore,
      page,
      pageSize,
    });

    const breakdownByType: Record<string, number> = {};
    for (const f of filings) {
      const t = f.signalType ?? 'unknown';
      breakdownByType[t] = (breakdownByType[t] ?? 0) + 1;
    }

    const result = {
      filings,
      totalCount,
      breakdownByType,
      page,
      pageSize,
      fetchedAt: new Date().toISOString(),
      dataSources: ['County Recorder', 'County Circuit Court'],
      dataFreshness: 'daily',
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
