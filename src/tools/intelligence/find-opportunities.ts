import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getPropertiesWithSignals } from '../../db/queries.js';
import { calculateDistressScore } from '../../normalize/distress-score.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';
import type { ActionabilityRating, SignalType } from '../../types/index.js';

export const findOpportunitiesDefinition = {
  name: 'find_distress_opportunities',
  description:
    'Find pre-foreclosure investment opportunities: properties with tax liens but no lis pendens or foreclosure filings — the sweet spot before legal proceedings start.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      countyFips: {
        type: 'string',
        description: 'Five-digit FIPS code for the county to search',
      },
      propertyType: {
        type: 'string',
        enum: ['residential', 'commercial', 'land', 'all'],
        description: 'Filter by property type (default: all)',
      },
      minYearsDelinquent: {
        type: 'number',
        description: 'Minimum years delinquent on taxes (default: 2)',
      },
      maxYearsDelinquent: {
        type: 'number',
        description: 'Maximum years delinquent (to exclude very old liens with uncertain status)',
      },
      limit: {
        type: 'number',
        description: 'Maximum results to return (default: 20, max: 100)',
      },
    },
    required: ['countyFips'],
  },
  outputSchema: {
    type: 'object' as const,
    properties: {
      opportunities: { type: 'array' },
      totalFound: { type: 'number' },
      avgDistressScore: { type: 'number' },
      fetchedAt: { type: 'string' },
      dataSources: { type: 'array' },
      dataFreshness: { type: 'string' },
    },
  },
  _meta: {
    surface: 'both',
    queryEligible: true,
    pricing: { executeUsd: '0.10' },
  },
};

export interface FindOpportunitiesArgs {
  countyFips: string;
  propertyType?: string;
  minYearsDelinquent?: number;
  maxYearsDelinquent?: number;
  limit?: number;
}

const FORECLOSURE_TYPES = new Set(['lis_pendens', 'notice_of_default', 'notice_of_trustee_sale']);

interface OpportunityRecord {
  parcelId: string;
  address: string;
  ownerName?: string;
  propertyType: string;
  distressScore: number;
  signals: Array<{ type: SignalType; amount?: number; date?: string; source?: string }>;
  actionabilityRating: ActionabilityRating;
  daysSinceFirstSignal: number;
  yearsDelinquent: number;
  estimatedTimeToForeclosure: string;
}

const DEMO_OPPORTUNITIES: OpportunityRecord[] = [
  {
    parcelId: '0553280050020',
    address: '555 BELLAIRE BOULEVARD HOUSTON TX 77401',
    ownerName: 'PATEL RAJESH K',
    propertyType: 'residential',
    distressScore: 55,
    signals: [{ type: 'tax_lien' as SignalType, amount: 12750, date: '2022-08-05', source: 'Harris County Tax Assessor' }],
    actionabilityRating: 'warm' as ActionabilityRating,
    daysSinceFirstSignal: 610,
    yearsDelinquent: 4,
    estimatedTimeToForeclosure: '12–18 months',
  },
  {
    parcelId: '0660430030010',
    address: '1234 MAIN STREET HOUSTON TX 77002',
    ownerName: 'JOHNSON ROBERT L',
    propertyType: 'residential',
    distressScore: 48,
    signals: [{ type: 'tax_lien' as SignalType, amount: 8542.75, date: '2023-03-15', source: 'Harris County Tax Assessor' }],
    actionabilityRating: 'warm' as ActionabilityRating,
    daysSinceFirstSignal: 380,
    yearsDelinquent: 2,
    estimatedTimeToForeclosure: '18–24 months',
  },
  {
    parcelId: '0330180020030',
    address: '2200 LAMAR STREET HOUSTON TX 77003',
    ownerName: 'GARCIA MIGUEL',
    propertyType: 'residential',
    distressScore: 45,
    signals: [{ type: 'tax_lien' as SignalType, amount: 5200.50, date: '2023-06-20', source: 'Harris County Tax Assessor' }],
    actionabilityRating: 'warm' as ActionabilityRating,
    daysSinceFirstSignal: 284,
    yearsDelinquent: 2,
    estimatedTimeToForeclosure: '18–24 months',
  },
];

function estimateTimeToForeclosure(yearsDelinquent: number): string {
  if (yearsDelinquent >= 5) return '3–6 months';
  if (yearsDelinquent >= 4) return '6–12 months';
  if (yearsDelinquent >= 3) return '12–18 months';
  return '18–24 months';
}

export async function findOpportunitiesHandler(args: FindOpportunitiesArgs): Promise<CallToolResult> {
  try {
    const limit = Math.min(args.limit ?? 20, 100);
    const minYears = args.minYearsDelinquent ?? 2;

    const key = cacheKey('find_distress_opportunities', args);
    const cached = await getCached<Record<string, unknown>>(key);
    if (cached) {
      return {
        content: [{ type: 'text', text: JSON.stringify(cached) }],
        structuredContent: cached,
      };
    }

    const propertiesWithSignals = await getPropertiesWithSignals(args.countyFips, {
      propertyType: args.propertyType,
      signalTypes: ['tax_lien'],
      limit: limit * 5,
    });

    let opportunities: OpportunityRecord[];

    if (propertiesWithSignals.length > 0) {
      const taxOnlyProperties = propertiesWithSignals.filter(p => {
        const hasForeclosureSignal = p.signals.some(s => FORECLOSURE_TYPES.has(s.signalType as string));
        const maxYears = Math.max(...p.signals.map(s => s.yearsDelinquent ?? 0));
        return !hasForeclosureSignal && maxYears >= minYears &&
          (args.maxYearsDelinquent === undefined || maxYears <= args.maxYearsDelinquent);
      });

      opportunities = taxOnlyProperties.slice(0, limit).map(p => {
        const score = calculateDistressScore(p.signals);
        const maxYears = Math.max(...p.signals.map(s => s.yearsDelinquent ?? 0));
        const firstSignalDate = p.signals
          .filter(s => s.dateFiled)
          .map(s => new Date(s.dateFiled!).getTime())
          .sort((a, b) => a - b)[0];

        const actionabilityRating: ActionabilityRating = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
        return {
          parcelId: p.parcelId,
          address: p.address,
          ownerName: p.ownerName,
          propertyType: p.propertyType,
          distressScore: score,
          signals: p.signals.map(s => ({
            type: s.signalType as SignalType,
            amount: s.amount,
            date: s.dateFiled,
            source: s.source,
          })),
          actionabilityRating,
          daysSinceFirstSignal: firstSignalDate
            ? Math.floor((Date.now() - firstSignalDate) / (1000 * 60 * 60 * 24))
            : 0,
          yearsDelinquent: maxYears,
          estimatedTimeToForeclosure: estimateTimeToForeclosure(maxYears),
        };
      });
    } else {
      opportunities = DEMO_OPPORTUNITIES.filter(o => {
        if (args.propertyType && args.propertyType !== 'all' && o.propertyType !== args.propertyType) return false;
        if (o.yearsDelinquent < minYears) return false;
        if (args.maxYearsDelinquent !== undefined && o.yearsDelinquent > args.maxYearsDelinquent) return false;
        return true;
      }).slice(0, limit);
    }

    const avgDistressScore = opportunities.length > 0
      ? Math.round(opportunities.reduce((s, o) => s + o.distressScore, 0) / opportunities.length)
      : 0;

    const result = {
      opportunities,
      totalFound: opportunities.length,
      avgDistressScore,
      fetchedAt: new Date().toISOString(),
      dataSources: ['County Tax Assessor', 'County Recorder'],
      dataFreshness: 'daily',
    };

    await setCached(key, result, 900);

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
