import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const ARCGIS_URL =
  'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/REAL_ESTATE_TAX_DELINQUENCIES/FeatureServer/0/query';
const PAGE_SIZE = 1000;

function getField(attrs: Record<string, unknown>, ...candidates: string[]): string | undefined {
  for (const key of candidates) {
    // Try exact match first
    if (attrs[key] !== undefined && attrs[key] !== null && attrs[key] !== '') {
      return String(attrs[key]);
    }
    // Try uppercase
    const upper = key.toUpperCase();
    if (attrs[upper] !== undefined && attrs[upper] !== null && attrs[upper] !== '') {
      return String(attrs[upper]);
    }
    // Try lowercase
    const lower = key.toLowerCase();
    if (attrs[lower] !== undefined && attrs[lower] !== null && attrs[lower] !== '') {
      return String(attrs[lower]);
    }
  }
  return undefined;
}

export class PhiladelphiaAdapter extends BaseAdapter {
  countyFips = '42101';
  countyName = 'Philadelphia County';
  state = 'PA';

  async scrape(): Promise<ScrapedRecord[]> {
    const records: ScrapedRecord[] = [];
    let offset = 0;

    try {
      while (true) {
        const params = new URLSearchParams({
          where: '1=1',
          outFields: '*',
          f: 'json',
          resultOffset: String(offset),
          resultRecordCount: String(PAGE_SIZE),
        });

        const response = await fetch(`${ARCGIS_URL}?${params}`, {
          signal: AbortSignal.timeout(30_000),
        });

        if (!response.ok) {
          console.error(
            `[PhiladelphiaAdapter] ArcGIS API error: ${response.status} ${response.statusText}`,
          );
          break;
        }

        const data = await response.json() as { features?: Array<{ attributes: Record<string, unknown> }> };

        if (!Array.isArray(data.features) || data.features.length === 0) break;

        const features = data.features;

        if (offset === 0 && features.length > 0) {
          console.log('[PhiladelphiaAdapter] Sample record keys:', Object.keys(features[0].attributes));
          console.log(
            '[PhiladelphiaAdapter] Sample record:',
            JSON.stringify(features[0].attributes).slice(0, 500),
          );
        }

        for (const feature of features) {
          const attrs = feature.attributes;

          const parcelId = getField(attrs, 'OPA_NUMBER', 'opa_number', 'opa_account_num', 'parcel_number', 'account_number');
          if (!parcelId) continue;

          const address = getField(attrs, 'STREET_ADDRESS', 'location', 'address', 'property_address', 'street_address');
          const zip = getField(attrs, 'ZIP_CODE', 'zip_code', 'zipcode', 'zip');
          const rawAddress = address
            ? `${address} Philadelphia PA${zip ? ` ${zip}` : ''}`
            : `OPA ${parcelId} Philadelphia PA`;

          const owner = getField(attrs, 'OWNER', 'owner', 'owner_name', 'taxpayer_name');

          const amountStr = getField(attrs, 'TOTAL_DUE', 'total_due', 'total', 'PRINCIPAL_DUE', 'principal_due', 'principal', 'amount_due');
          const amount = amountStr ? parseFloat(amountStr) : undefined;

          const numYearsOwed = getField(attrs, 'NUM_YEARS_OWED', 'num_years_owed');
          const yearStr = getField(attrs, 'OLDEST_YEAR_OWED', 'MOST_RECENT_YEAR_OWED', 'tax_period', 'tax_year', 'year_due', 'year');
          const year = yearStr ? parseInt(yearStr, 10) : undefined;
          const currentYear = new Date().getFullYear();
          const yearsDelinquent = numYearsOwed
            ? Number(numYearsOwed)
            : (year && Number.isFinite(year) ? currentYear - year : undefined);

          const oldestYear = getField(attrs, 'OLDEST_YEAR_OWED', 'oldest_year_owed');
          const dateFiled = oldestYear
            ? `${oldestYear}-01-01`
            : (year && Number.isFinite(year) ? `${year}-01-01` : undefined);

          const buildingCategory = getField(attrs, 'BUILDING_CATEGORY', 'building_category', 'GENERAL_BUILDING_DESCRIPTION', 'general_building_description');
          const cat = buildingCategory?.toLowerCase() ?? '';
          const propertyType =
            cat.includes('commercial') || cat.includes('office') || cat.includes('store') || cat.includes('industrial')
              ? 'commercial'
              : cat.includes('land') || cat.includes('vacant')
                ? 'land'
                : 'residential';

          records.push({
            rawParcelId: parcelId,
            rawAddress,
            ownerName: owner,
            propertyType,
            signalType: 'tax_lien',
            amount: amount !== undefined && Number.isFinite(amount) ? amount : undefined,
            dateFiled,
            yearsDelinquent,
            source: 'Philadelphia Department of Revenue - Real Estate Tax Delinquencies',
          });
        }

        if (features.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }
    } catch (err) {
      console.error('[PhiladelphiaAdapter] Failed to fetch ArcGIS data:', err);
    }

    console.log(`[PhiladelphiaAdapter] Fetched ${records.length} records from ArcGIS API`);
    return records;
  }
}
