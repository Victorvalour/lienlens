import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const ARCGIS_URL =
  'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/REAL_ESTATE_TAX_DELINQUENCIES/FeatureServer/0/query';
const PAGE_SIZE = 1000;

function getField(attrs: Record<string, unknown>, ...candidates: string[]): string | undefined {
  for (const key of candidates) {
    const val = attrs[key];
    if (val !== undefined && val !== null && val !== '') {
      return String(val);
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

          const parcelId = getField(attrs, 'opa_number', 'opa_account_num', 'parcel_number', 'account_number');
          if (!parcelId) continue;

          const address = getField(attrs, 'location', 'address', 'property_address', 'street_address');
          const zip = getField(attrs, 'zip_code', 'zipcode', 'zip');
          const rawAddress = address
            ? `${address} Philadelphia PA${zip ? ` ${zip}` : ''}`
            : `OPA ${parcelId} Philadelphia PA`;

          const owner = getField(attrs, 'owner', 'owner_name', 'taxpayer_name');

          const amountStr = getField(attrs, 'total_due', 'total', 'principal_due', 'principal', 'amount_due');
          const amount = amountStr ? parseFloat(amountStr) : undefined;

          const yearStr = getField(attrs, 'tax_period', 'tax_year', 'year_due', 'year');
          const year = yearStr ? parseInt(yearStr, 10) : undefined;
          const currentYear = new Date().getFullYear();
          const yearsDelinquent =
            year && Number.isFinite(year) ? currentYear - year : undefined;

          const dateFiled = year && Number.isFinite(year) ? `${year}-01-01` : undefined;

          records.push({
            rawParcelId: parcelId,
            rawAddress,
            ownerName: owner,
            propertyType: 'residential',
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
