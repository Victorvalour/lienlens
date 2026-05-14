import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getCounties } from '../../db/queries.js';
import { cacheKey, getCached, setCached } from '../../cache/redis.js';
export const listSupportedCountiesDefinition = {
  name: 'list_supported_counties',
  description:
    'List all counties supported by LienLens with metadata about data availability, record counts, and ingestion status.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      state: {
        type: 'string',
        description: 'Optional two-letter state code to filter results (e.g. "TX", "IL", "AZ")',
      },
    },
    required: [],
  },
  outputSchema: {
    type: 'object' as const,
    properties: {
      counties: {
        type: 'array',
        description:
          'Each county object includes amountFieldsAvailable: false when its upstream public source does not publish dollar amounts (NYC). Callers should rank such counties by signal count, not dollars.',
      },
      totalCount: { type: 'number' },
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

interface ListSupportedCountiesArgs {
  state?: string;
}

export async function listSupportedCountiesHandler(
  args: ListSupportedCountiesArgs
): Promise<CallToolResult> {
  try {
    const key = cacheKey('list_supported_counties', args);
    const cached = await getCached<Record<string, unknown>>(key);
    if (cached) {
      return {
        content: [{ type: 'text', text: JSON.stringify(cached) }],
        structuredContent: cached,
      };
    }

    const counties = await getCounties(args.state);

    // FIPS codes whose upstream public source does not publish dollar amounts.
    // Currently only NYC (Department of Finance tax-lien sale list).
    const NO_AMOUNT_FIPS = new Set(['36061']);
    const enrichedCounties = counties.map(c => ({
      ...c,
      amountFieldsAvailable: !NO_AMOUNT_FIPS.has(c.fips),
      ...(NO_AMOUNT_FIPS.has(c.fips)
        ? {
            dataLimitations: [
              'Lien presence and parcel metadata only. Dollar amount fields are not published by the upstream public source.',
            ],
          }
        : {}),
    }));

    const result = {
      counties: enrichedCounties,
      totalCount: enrichedCounties.length,
      fetchedAt: new Date().toISOString(),
      dataSources: counties.map(c => c.adapterName).filter(Boolean),
      dataFreshness: 'daily' as const,
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
