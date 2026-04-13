import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getTaxDelinquencies } from '../../db/queries.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';

export const getTaxDelinquenciesDefinition = {
  name: 'get_tax_delinquencies',
  description:
    'Retrieve tax delinquency records for a county, with filtering by amount, years delinquent, property type, and tax-sale scheduling status.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      countyFips: {
        type: 'string',
        description: 'Five-digit FIPS code for the county',
      },
      minAmount: { type: 'number', description: 'Minimum delinquent tax amount' },
      maxAmount: { type: 'number', description: 'Maximum delinquent tax amount' },
      minYearsDelinquent: { type: 'number', description: 'Minimum number of years delinquent' },
      propertyType: {
        type: 'string',
        enum: ['residential', 'commercial', 'land', 'all'],
        description: 'Filter by property type',
      },
      taxSaleScheduled: { type: 'boolean', description: 'Filter to properties with a scheduled tax sale' },
      page: { type: 'number', description: 'Page number (default: 1)' },
      pageSize: { type: 'number', description: 'Results per page (default: 50, max: 200)' },
    },
    required: ['countyFips'],
  },
  outputSchema: {
    type: 'object' as const,
    properties: {
      delinquencies: { type: 'array' },
      totalCount: { type: 'number' },
      totalAmountOutstanding: { type: 'number' },
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

interface GetTaxDelinquenciesArgs {
  countyFips: string;
  minAmount?: number;
  maxAmount?: number;
  minYearsDelinquent?: number;
  propertyType?: string;
  taxSaleScheduled?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getTaxDelinquenciesHandler(
  args: GetTaxDelinquenciesArgs
): Promise<CallToolResult> {
  try {
    const pageSize = Math.min(args.pageSize ?? 50, 200);
    const page = args.page ?? 1;

    const key = cacheKey('get_tax_delinquencies', args);
    const cached = await getCached<Record<string, unknown>>(key);
    if (cached) {
      return {
        content: [{ type: 'text', text: JSON.stringify(cached) }],
        structuredContent: cached,
      };
    }

    const { delinquencies, totalCount } = await getTaxDelinquencies(args.countyFips, {
      minAmount: args.minAmount,
      maxAmount: args.maxAmount,
      minYearsDelinquent: args.minYearsDelinquent,
      propertyType: args.propertyType,
      taxSaleScheduled: args.taxSaleScheduled,
      page,
      pageSize,
    });

    const totalAmountOutstanding = delinquencies.reduce((sum, d) => sum + d.amount, 0);

    const result = {
      delinquencies,
      totalCount,
      totalAmountOutstanding,
      page,
      pageSize,
      fetchedAt: new Date().toISOString(),
      dataSources: ['County Tax Assessor'],
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
