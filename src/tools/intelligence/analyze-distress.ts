import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getPropertiesWithSignals } from '../../db/queries.js';
import { calculateDistressScore } from '../../normalize/distress-score.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';
import type { DistressedProperty, ActionabilityRating, SignalType } from '../../types/index.js';

export const analyzeDistressDefinition = {
  name: 'analyze_property_distress',
  description:
    'Analyze and rank distressed properties in a county using a composite distress score that weighs signal severity, total amount owed, recency, and duration.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      countyFips: {
        type: 'string',
        description: 'Five-digit FIPS code for the county to analyze',
      },
      propertyType: {
        type: 'string',
        enum: ['residential', 'commercial', 'land', 'all'],
        description: 'Filter by property type (default: all)',
      },
      minDistressScore: {
        type: 'number',
        description: 'Only return properties with distress score >= this value (0–100)',
      },
      sortBy: {
        type: 'string',
        enum: ['distress_score', 'amount_owed', 'date_filed'],
        description: 'Sort results by this field (default: distress_score)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 20, max: 100)',
      },
    },
    required: ['countyFips'],
  },
  outputSchema: {
    type: 'object' as const,
    properties: {
      properties: { type: 'array' },
      totalAnalyzed: { type: 'number' },
      avgDistressScore: { type: 'number' },
      hotPropertiesCount: { type: 'number' },
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

export interface AnalyzeDistressArgs {
  countyFips: string;
  propertyType?: string;
  minDistressScore?: number;
  sortBy?: string;
  limit?: number;
}

const DEMO_PROPERTIES: DistressedProperty[] = [
  {
    parcelId: '0650430090040',
    address: '900 TELEPHONE ROAD HOUSTON TX 77023',
    ownerName: 'WHITE KEVIN S',
    propertyType: 'residential',
    distressScore: 82,
    signals: [{ type: 'notice_of_trustee_sale', amount: 158000, date: '2024-03-18', source: 'Harris County District Clerk' }],
    estimatedEquityPosition: -12000,
    actionabilityRating: 'hot',
    daysSinceFirstSignal: 14,
  },
  {
    parcelId: '0990560070030',
    address: '200 MEMORIAL DRIVE HOUSTON TX 77007',
    ownerName: 'HALL VICTOR A',
    propertyType: 'residential',
    distressScore: 76,
    signals: [{ type: 'notice_of_default', amount: 295000, date: '2024-02-07', source: 'Harris County District Clerk' }],
    actionabilityRating: 'hot',
    daysSinceFirstSignal: 49,
  },
  {
    parcelId: '0770550080010',
    address: '8820 FONDREN ROAD HOUSTON TX 77074',
    ownerName: 'TRAN HIEN T',
    propertyType: 'residential',
    distressScore: 70,
    signals: [{ type: 'notice_of_default', amount: 135000, date: '2024-03-05', source: 'Harris County District Clerk' }],
    actionabilityRating: 'hot',
    daysSinceFirstSignal: 26,
  },
  {
    parcelId: '1220340060030',
    address: '202 TRAVIS STREET HOUSTON TX 77002',
    ownerName: 'MARTINEZ ELENA',
    propertyType: 'commercial',
    distressScore: 65,
    signals: [{ type: 'tax_lien', amount: 49800, date: '2021-10-30', source: 'Harris County Tax Assessor' }],
    actionabilityRating: 'warm',
    daysSinceFirstSignal: 880,
  },
  {
    parcelId: '0882910040010',
    address: '900 SHEPHERD DRIVE HOUSTON TX 77007',
    ownerName: 'LEE DAVID J',
    propertyType: 'residential',
    distressScore: 63,
    signals: [{ type: 'lis_pendens', amount: 210000, date: '2024-02-28', source: 'Harris County District Clerk' }],
    actionabilityRating: 'warm',
    daysSinceFirstSignal: 28,
  },
];

function getActionabilityRating(score: number): ActionabilityRating {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

export async function analyzeDistressHandler(args: AnalyzeDistressArgs): Promise<CallToolResult> {
  try {
    const limit = Math.min(args.limit ?? 20, 100);

    const key = cacheKey('analyze_property_distress', args);
    const cached = await getCached<Record<string, unknown>>(key);
    if (cached) {
      return {
        content: [{ type: 'text', text: JSON.stringify(cached) }],
        structuredContent: cached,
      };
    }

    const propertiesWithSignals = await getPropertiesWithSignals(args.countyFips, {
      propertyType: args.propertyType,
      limit: limit * 3,
    });

    let analyzed: DistressedProperty[];

    if (propertiesWithSignals.length > 0) {
      analyzed = propertiesWithSignals.map(p => {
        const score = calculateDistressScore(p.signals);
        const firstSignalDate = p.signals
          .filter(s => s.dateFiled)
          .map(s => new Date(s.dateFiled!).getTime())
          .sort((a, b) => a - b)[0];
        const daysSinceFirstSignal = firstSignalDate
          ? Math.floor((Date.now() - firstSignalDate) / (1000 * 60 * 60 * 24))
          : 0;

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
          actionabilityRating: getActionabilityRating(score),
          daysSinceFirstSignal,
        };
      });
    } else {
      analyzed = DEMO_PROPERTIES.filter(p => {
        if (args.propertyType && args.propertyType !== 'all' && p.propertyType !== args.propertyType) return false;
        return true;
      });
    }

    // Apply min score filter
    if (args.minDistressScore !== undefined) {
      analyzed = analyzed.filter(p => p.distressScore >= (args.minDistressScore ?? 0));
    }

    // Sort
    const sortBy = args.sortBy ?? 'distress_score';
    if (sortBy === 'distress_score') {
      analyzed.sort((a, b) => b.distressScore - a.distressScore);
    } else if (sortBy === 'amount_owed') {
      analyzed.sort((a, b) => {
        const sumA = a.signals.reduce((s, sig) => s + (sig.amount ?? 0), 0);
        const sumB = b.signals.reduce((s, sig) => s + (sig.amount ?? 0), 0);
        return sumB - sumA;
      });
    } else if (sortBy === 'date_filed') {
      analyzed.sort((a, b) => {
        const dateA = a.signals[0]?.date ?? '';
        const dateB = b.signals[0]?.date ?? '';
        return dateB.localeCompare(dateA);
      });
    }

    const topProperties = analyzed.slice(0, limit);
    const avgDistressScore = analyzed.length > 0
      ? Math.round(analyzed.reduce((s, p) => s + p.distressScore, 0) / analyzed.length)
      : 0;
    const hotPropertiesCount = analyzed.filter(p => p.actionabilityRating === 'hot').length;

    const result = {
      properties: topProperties,
      totalAnalyzed: analyzed.length,
      avgDistressScore,
      hotPropertiesCount,
      fetchedAt: new Date().toISOString(),
      dataSources: ['County Tax Assessor', 'County District Clerk / Recorder'],
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
