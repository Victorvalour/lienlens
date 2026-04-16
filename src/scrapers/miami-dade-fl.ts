import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const ARCGIS_URL =
  'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/Tax_Delinquent_Properties/FeatureServer/0/query';
const PAGE_SIZE = 1000;

function getField(attrs: Record<string, unknown>, ...candidates: string[]): string | undefined {
  for (const key of candidates) {
    if (attrs[key] !== undefined && attrs[key] !== null && attrs[key] !== '') {
      return String(attrs[key]);
    }
    const upper = key.toUpperCase();
    if (attrs[upper] !== undefined && attrs[upper] !== null && attrs[upper] !== '') {
      return String(attrs[upper]);
    }
    const lower = key.toLowerCase();
    if (attrs[lower] !== undefined && attrs[lower] !== null && attrs[lower] !== '') {
      return String(attrs[lower]);
    }
  }
  return undefined;
}

export class MiamiDadeAdapter extends BaseAdapter {
  countyFips = '12086';
  countyName = 'Miami-Dade County';
  state = 'FL';

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
          console.error(`[MiamiDadeAdapter] ArcGIS error: ${response.status} ${response.statusText}`);
          break;
        }

        const data = await response.json() as { features?: Array<{ attributes: Record<string, unknown> }> };

        if (!Array.isArray(data.features) || data.features.length === 0) break;

        if (offset === 0 && data.features.length > 0) {
          console.log('[MiamiDadeAdapter] Sample record keys:', Object.keys(data.features[0]!.attributes));
        }

        for (const feature of data.features) {
          const attrs = feature.attributes;

          const folio = getField(attrs, 'FOLIO', 'folio', 'FOLIO_NUMBER', 'PARCEL', 'parcel_id');
          if (!folio) continue;

          const address = getField(attrs, 'PROPERTY_ADDRESS', 'ADDRESS', 'SITE_ADDRESS', 'SITUS_ADDRESS');
          const city = getField(attrs, 'CITY', 'MUNICIPALITY');
          const zip = getField(attrs, 'ZIP_CODE', 'ZIP');
          const rawAddress = address
            ? `${address} ${city ?? 'Miami'} FL${zip ? ` ${zip}` : ''}`.trim()
            : `Folio ${folio} Miami FL`;

          const owner = getField(attrs, 'OWNER_NAME', 'OWNER', 'OWNER1');

          const amountStr = getField(attrs, 'TOTAL_DUE', 'AMOUNT_DUE', 'TAX_AMOUNT', 'DELINQUENT_AMOUNT');
          const amount = amountStr ? parseFloat(amountStr) : undefined;

          const yearStr = getField(attrs, 'TAX_YEAR', 'YEAR');
          const year = yearStr ? parseInt(yearStr, 10) : undefined;
          const currentYear = new Date().getFullYear();
          const yearsDelinquent = year && Number.isFinite(year) ? currentYear - year : undefined;

          records.push({
            rawParcelId: folio,
            rawAddress,
            ownerName: owner,
            signalType: 'tax_lien',
            amount: amount !== undefined && Number.isFinite(amount) ? amount : undefined,
            dateFiled: year ? `${year}-01-01` : undefined,
            yearsDelinquent,
            source: 'Miami-Dade County Tax Collector',
          });
        }

        if (data.features.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }
    } catch (err) {
      console.error('[MiamiDadeAdapter] Failed to fetch ArcGIS data:', err);
    }

    console.log(`[MiamiDadeAdapter] Fetched ${records.length} records from ArcGIS API`);
    return records;
  }
}
