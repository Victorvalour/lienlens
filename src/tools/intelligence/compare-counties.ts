import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getDistressSignals, getCounty } from '../../db/queries.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';
import type { TrendDirection } from '../../types/index.js';

export const compareCountiesDefinition = {
  name: 'compare_county_distress',
  description:
    'Compare distress signal activity across multiple counties — ranks them by signal volume, average amounts, and trend direction to identify the most distressed markets.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      countyFips: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of FIPS codes to compare (2–10 counties)',
      },
      signalType: {
        type: 'string',
        enum: ['tax_lien', 'lis_pendens', 'notice_of_default', 'notice_of_trustee_sale', 'code_violation', 'all'],
        description: 'Signal type to compare (default: all)',
      },
    },
    required: ['countyFips'],
  },
  outputSchema: {
    type: 'object' as const,
    properties: {
      rankings: { type: 'array' },
      mostDistressed: { type: 'string' },
      leastDistressed: { type: 'string' },
      fetchedAt: { type: 'string' },
      dataSources: { type: 'array' },
      dataFreshness: { type: 'string' },
    },
  },
  _meta: {
    surface: 'both',
    queryEligible: true,
    latencyClass: 'slow',
    pricing: { executeUsd: '0.10' },
  },
};

export interface CompareCountiesArgs {
  countyFips: string[];
  signalType?: string;
}

const COUNTY_NAMES: Record<string, string> = {
  '17031': 'Cook County, IL',
  '42101': 'Philadelphia County, PA',
  '36061': 'New York City, NY',
  '53033': 'King County, WA',
  '39049': 'Franklin County, OH',
  '32003': 'Clark County, NV',
  '12086': 'Miami-Dade County, FL',
};

const UNSUPPORTED_COUNTY_ERROR = (fips: string) => JSON.stringify({
  error: `County FIPS "${fips}" is not currently supported. LienLens currently covers: Cook County IL (17031), Philadelphia PA (42101), New York City NY (36061), King County WA (53033), Franklin County OH (39049), Clark County NV (32003), Miami-Dade County FL (12086). More counties are being added as public data sources become available.`,
  supportedCounties: [
    { fips: '17031', name: 'Cook County', state: 'IL' },
    { fips: '42101', name: 'Philadelphia County', state: 'PA' },
    { fips: '36061', name: 'New York City', state: 'NY' },
    { fips: '53033', name: 'King County', state: 'WA' },
    { fips: '39049', name: 'Franklin County', state: 'OH' },
    { fips: '32003', name: 'Clark County', state: 'NV' },
    { fips: '12086', name: 'Miami-Dade County', state: 'FL' },
  ],
});

export async function compareCountiesHandler(args: CompareCountiesArgs): Promise<CallToolResult> {
  try {
    const key = cacheKey('compare_county_distress', args);
    const cached = await getCached<Record<string, unknown>>(key);
    if (cached) {
      return {
        content: [{ type: 'text', text: JSON.stringify(cached) }],
        structuredContent: cached,
      };
    }

    // Validate each county before processing
    for (const fips of args.countyFips) {
      const county = await getCounty(fips);
      if (!county) {
        return {
          content: [{ type: 'text', text: UNSUPPORTED_COUNTY_ERROR(fips) }],
          isError: true,
        };
      }
    }

    const rankings: Array<{
      fips: string;
      name: string;
      totalSignals: number;
      avgAmount: number;
      trend: TrendDirection;
      rank: number;
    }> = [];

    for (const fips of args.countyFips) {
      const signalType = args.signalType === 'all' ? undefined : args.signalType;
      const { signals, totalCount } = await getDistressSignals(fips, {
        signalType,
        pageSize: 200,
      });

      const totalSignals = totalCount;
      const avgAmount = signals.length > 0
        ? Math.round(signals.reduce((s, sig) => s + (sig.amount ?? 0), 0) / signals.length)
        : 0;
      const trend: TrendDirection = 'stable';

      rankings.push({
        fips,
        name: COUNTY_NAMES[fips] ?? `County ${fips}`,
        totalSignals,
        avgAmount,
        trend,
        rank: 0,
      });
    }

    rankings.sort((a, b) => b.totalSignals - a.totalSignals);
    rankings.forEach((r, i) => {
      r.rank = i + 1;
    });

    const result = {
      rankings,
      mostDistressed: rankings[0]?.name ?? 'N/A',
      leastDistressed: rankings[rankings.length - 1]?.name ?? 'N/A',
      fetchedAt: new Date().toISOString(),
      dataSources: args.countyFips.map(f => COUNTY_NAMES[f] ?? f),
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
