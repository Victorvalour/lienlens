import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getDistressSignals, getCounty } from '../../db/queries.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';

export const getDistressSignalsDefinition = {
  name: 'get_distress_signals',
  description:
    'Retrieve paginated tax delinquency signals for a given county with optional filtering.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      countyFips: {
        type: 'string',
        description: 'Five-digit FIPS code for the county (e.g. "17031" for Cook County IL)',
      },
      signalType: {
        type: 'string',
        enum: ['tax_lien'],
        description: 'Filter by signal type (currently only tax_lien is supported)',
      },
      minAmount: { type: 'number', description: 'Minimum dollar amount' },
      maxAmount: { type: 'number', description: 'Maximum dollar amount' },
      filedAfter: { type: 'string', description: 'ISO date string — only signals filed on or after this date' },
      filedBefore: { type: 'string', description: 'ISO date string — only signals filed on or before this date' },
      page: { type: 'number', description: 'Page number (default: 1)' },
      pageSize: { type: 'number', description: 'Results per page (default: 50, max: 200)' },
    },
    required: ['countyFips'],
  },
  outputSchema: {
    type: 'object' as const,
    properties: {
      signals: { type: 'array' },
      totalCount: { type: 'number' },
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

interface GetDistressSignalsArgs {
  countyFips: string;
  signalType?: string;
  minAmount?: number;
  maxAmount?: number;
  filedAfter?: string;
  filedBefore?: string;
  page?: number;
  pageSize?: number;
}

const UNSUPPORTED_COUNTY_ERROR = (fips: string) => JSON.stringify({
  error: `County FIPS "${fips}" is not currently supported. LienLens currently covers: Cook County IL (17031), Philadelphia PA (42101), New York City NY (36061), Franklin County OH (39049). More counties are being added as public data sources become available.`,
  supportedCounties: [
    { fips: '17031', name: 'Cook County', state: 'IL' },
    { fips: '42101', name: 'Philadelphia County', state: 'PA' },
    { fips: '36061', name: 'New York City', state: 'NY' },
    { fips: '39049', name: 'Franklin County', state: 'OH' },
  ],
});

export async function getDistressSignalsHandler(
  args: GetDistressSignalsArgs
): Promise<CallToolResult> {
  try {
    const pageSize = Math.min(args.pageSize ?? 50, 200);
    const page = args.page ?? 1;

    const key = cacheKey('get_distress_signals', args);
    const cached = await getCached<Record<string, unknown>>(key);
    if (cached) {
      return {
        content: [{ type: 'text', text: JSON.stringify(cached) }],
        structuredContent: cached,
      };
    }

    const county = await getCounty(args.countyFips);
    if (!county) {
      return {
        content: [{ type: 'text', text: UNSUPPORTED_COUNTY_ERROR(args.countyFips) }],
        isError: true,
      };
    }

    const { signals, totalCount } = await getDistressSignals(args.countyFips, {
      signalType: args.signalType,
      minAmount: args.minAmount,
      maxAmount: args.maxAmount,
      filedAfter: args.filedAfter,
      filedBefore: args.filedBefore,
      page,
      pageSize,
    });

    const result = {
      signals,
      totalCount,
      page,
      pageSize,
      fetchedAt: new Date().toISOString(),
      dataSources: ['County Tax Assessor', 'County District Clerk / Recorder'],
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
