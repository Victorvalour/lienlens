import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getPropertiesWithSignals, getCounty } from '../../db/queries.js';
import { calculateDistressScore } from '../../normalize/distress-score.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';
import type { ActionabilityRating, SignalType } from '../../types/index.js';

export const findOpportunitiesDefinition = {
  name: 'find_distress_opportunities',
  description:
    'Find tax delinquency investment opportunities: properties with significant tax delinquency exposure — high amounts owed, multiple years delinquent — ranked by distress score.',
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
    latencyClass: 'fast',
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

function estimateTimeToForeclosure(yearsDelinquent: number): string {
  if (yearsDelinquent >= 5) return '3–6 months';
  if (yearsDelinquent >= 4) return '6–12 months';
  if (yearsDelinquent >= 3) return '12–18 months';
  return '18–24 months';
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

    const county = await getCounty(args.countyFips);
    if (!county) {
      return {
        content: [{ type: 'text', text: UNSUPPORTED_COUNTY_ERROR(args.countyFips) }],
        isError: true,
      };
    }

    const propertiesWithSignals = await getPropertiesWithSignals(args.countyFips, {
      propertyType: args.propertyType,
      signalTypes: ['tax_lien'],
      limit: limit * 5,
    });

    const taxOnlyProperties = propertiesWithSignals.filter(p => {
      const maxYears = Math.max(...p.signals.map(s => s.yearsDelinquent ?? 0));
      return maxYears >= minYears &&
        (args.maxYearsDelinquent === undefined || maxYears <= args.maxYearsDelinquent);
    });

    const opportunities: OpportunityRecord[] = taxOnlyProperties.slice(0, limit).map(p => {
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
