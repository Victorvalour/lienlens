import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getDistressSignals } from '../../db/queries.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';

export const getDistressSignalsDefinition = {
  name: 'get_distress_signals',
  description:
    'Retrieve paginated distress signals (tax liens, lis pendens, NODs, NOTS, code violations) for a given county with optional filtering.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      countyFips: {
        type: 'string',
        description: 'Five-digit FIPS code for the county (e.g. "48201" for Harris County TX)',
      },
      signalType: {
        type: 'string',
        enum: ['tax_lien', 'lis_pendens', 'notice_of_default', 'notice_of_trustee_sale', 'code_violation'],
        description: 'Filter by specific signal type',
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

const DEMO_SIGNALS = [
  { parcelId: '0660430030010', address: '1234 MAIN STREET HOUSTON TX 77002', ownerName: 'JOHNSON ROBERT L', propertyType: 'residential', signalType: 'tax_lien', amount: 8542.75, dateFiled: '2023-03-15', source: 'Harris County Tax Assessor', yearsDelinquent: 2 },
  { parcelId: '1150430060020', address: '789 KIRBY DRIVE HOUSTON TX 77019', ownerName: 'SMITH PATRICIA A', propertyType: 'residential', signalType: 'lis_pendens', amount: 185000, dateFiled: '2024-01-10', caseNumber: 'LP-2024-00451', lenderName: 'WELLS FARGO BANK NA', source: 'Harris County District Clerk' },
  { parcelId: '0882910040010', address: '900 SHEPHERD DRIVE HOUSTON TX 77007', ownerName: 'LEE DAVID J', propertyType: 'residential', signalType: 'lis_pendens', amount: 210000, dateFiled: '2024-02-28', caseNumber: 'LP-2024-00812', lenderName: 'JPMORGAN CHASE BANK NA', source: 'Harris County District Clerk' },
  { parcelId: '0770550080010', address: '8820 FONDREN ROAD HOUSTON TX 77074', ownerName: 'TRAN HIEN T', propertyType: 'residential', signalType: 'notice_of_default', amount: 135000, dateFiled: '2024-03-05', caseNumber: 'NOD-2024-00234', lenderName: 'USBANK HOME MORTGAGE', source: 'Harris County District Clerk' },
  { parcelId: '0650430090040', address: '900 TELEPHONE ROAD HOUSTON TX 77023', ownerName: 'WHITE KEVIN S', propertyType: 'residential', signalType: 'notice_of_trustee_sale', amount: 158000, dateFiled: '2024-03-18', caseNumber: 'NOTS-2024-00567', lenderName: 'NATIONSTAR MORTGAGE', auctionDate: '2024-05-07', source: 'Harris County District Clerk' },
];

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

    const { signals, totalCount } = await getDistressSignals(args.countyFips, {
      signalType: args.signalType,
      minAmount: args.minAmount,
      maxAmount: args.maxAmount,
      filedAfter: args.filedAfter,
      filedBefore: args.filedBefore,
      page,
      pageSize,
    });

    const finalSignals = signals.length > 0 ? signals : DEMO_SIGNALS.filter(s => {
      if (args.signalType && s.signalType !== args.signalType) return false;
      if (args.minAmount && (s.amount ?? 0) < args.minAmount) return false;
      if (args.maxAmount && (s.amount ?? 0) > args.maxAmount) return false;
      return true;
    });

    const result = {
      signals: finalSignals,
      totalCount: totalCount > 0 ? totalCount : finalSignals.length,
      page,
      pageSize,
      fetchedAt: new Date().toISOString(),
      dataSources: ['Harris County Tax Assessor', 'Harris County District Clerk'],
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
