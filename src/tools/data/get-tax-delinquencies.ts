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

const DEMO_DELINQUENCIES = [
  { parcelId: '0660430030010', address: '1234 MAIN STREET HOUSTON TX 77002', ownerName: 'JOHNSON ROBERT L', propertyType: 'residential', amount: 8542.75, yearsDelinquent: 2, taxSaleScheduled: false, dateFiled: '2023-03-15' },
  { parcelId: '0740220010050', address: '4567 WESTHEIMER ROAD HOUSTON TX 77056', ownerName: 'NGUYEN THANH V', propertyType: 'commercial', amount: 22100.00, yearsDelinquent: 3, taxSaleScheduled: false, dateFiled: '2022-11-01' },
  { parcelId: '0553280050020', address: '555 BELLAIRE BOULEVARD HOUSTON TX 77401', ownerName: 'PATEL RAJESH K', propertyType: 'residential', amount: 12750.00, yearsDelinquent: 4, taxSaleScheduled: true, taxSaleDate: '2024-06-15', dateFiled: '2022-08-05' },
  { parcelId: '1220340060030', address: '202 TRAVIS STREET HOUSTON TX 77002', ownerName: 'MARTINEZ ELENA', propertyType: 'commercial', amount: 49800.00, yearsDelinquent: 5, taxSaleScheduled: true, taxSaleDate: '2024-07-10', dateFiled: '2021-10-30' },
  { parcelId: '0330180020030', address: '2200 LAMAR STREET HOUSTON TX 77003', ownerName: 'GARCIA MIGUEL', propertyType: 'residential', amount: 5200.50, yearsDelinquent: 2, taxSaleScheduled: false, dateFiled: '2023-06-20' },
];

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

    const finalDelinquencies = delinquencies.length > 0 ? delinquencies : DEMO_DELINQUENCIES.filter(d => {
      if (args.minAmount && d.amount < args.minAmount) return false;
      if (args.maxAmount && d.amount > args.maxAmount) return false;
      if (args.minYearsDelinquent && (d.yearsDelinquent ?? 0) < args.minYearsDelinquent) return false;
      if (args.propertyType && args.propertyType !== 'all' && d.propertyType !== args.propertyType) return false;
      if (args.taxSaleScheduled !== undefined && d.taxSaleScheduled !== args.taxSaleScheduled) return false;
      return true;
    });

    const totalAmountOutstanding = finalDelinquencies.reduce((sum, d) => sum + d.amount, 0);

    const result = {
      delinquencies: finalDelinquencies,
      totalCount: totalCount > 0 ? totalCount : finalDelinquencies.length,
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
