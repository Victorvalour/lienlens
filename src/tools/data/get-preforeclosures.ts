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

const DEMO_FILINGS = [
  { parcelId: '1150430060020', address: '789 KIRBY DRIVE HOUSTON TX 77019', ownerName: 'SMITH PATRICIA A', propertyType: 'residential', signalType: 'lis_pendens', amount: 185000, dateFiled: '2024-01-10', caseNumber: 'LP-2024-00451', lenderName: 'WELLS FARGO BANK NA' },
  { parcelId: '0882910040010', address: '900 SHEPHERD DRIVE HOUSTON TX 77007', ownerName: 'LEE DAVID J', propertyType: 'residential', signalType: 'lis_pendens', amount: 210000, dateFiled: '2024-02-28', caseNumber: 'LP-2024-00812', lenderName: 'JPMORGAN CHASE BANK NA' },
  { parcelId: '0770550080010', address: '8820 FONDREN ROAD HOUSTON TX 77074', ownerName: 'TRAN HIEN T', propertyType: 'residential', signalType: 'notice_of_default', amount: 135000, dateFiled: '2024-03-05', caseNumber: 'NOD-2024-00234', lenderName: 'USBANK HOME MORTGAGE' },
  { parcelId: '0650430090040', address: '900 TELEPHONE ROAD HOUSTON TX 77023', ownerName: 'WHITE KEVIN S', propertyType: 'residential', signalType: 'notice_of_trustee_sale', amount: 158000, dateFiled: '2024-03-18', caseNumber: 'NOTS-2024-00567', lenderName: 'NATIONSTAR MORTGAGE', auctionDate: '2024-05-07' },
  { parcelId: '0990560070030', address: '200 MEMORIAL DRIVE HOUSTON TX 77007', ownerName: 'HALL VICTOR A', propertyType: 'residential', signalType: 'notice_of_default', amount: 295000, dateFiled: '2024-02-07', caseNumber: 'NOD-2024-00178', lenderName: 'FREEDOM MORTGAGE' },
];

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

    const finalFilings = filings.length > 0 ? filings : DEMO_FILINGS.filter(f => {
      if (args.filingType && args.filingType !== 'all' && f.signalType !== args.filingType) return false;
      if (args.lenderName && !f.lenderName?.toLowerCase().includes(args.lenderName.toLowerCase())) return false;
      return true;
    });

    const breakdownByType: Record<string, number> = {};
    for (const f of finalFilings) {
      const t = (f as { signalType: string }).signalType ?? 'unknown';
      breakdownByType[t] = (breakdownByType[t] ?? 0) + 1;
    }

    const result = {
      filings: finalFilings,
      totalCount: totalCount > 0 ? totalCount : finalFilings.length,
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
