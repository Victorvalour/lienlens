import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const ARCGIS_URLS = [
  'https://gis.franklincountyohio.gov/hosting/rest/services/RealEstate/Neighborhood_Detail/MapServer/2/query',
  'https://services3.arcgis.com/4wQW7Sg4gXbYJh4K/ArcGIS/rest/services/RealEstate_Neighborhood_Detail/FeatureServer/2/query',
];
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

async function tryFetchFromUrl(arcgisUrl: string): Promise<ScrapedRecord[]> {
  const records: ScrapedRecord[] = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: '1=1',
      outFields: '*',
      f: 'json',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
    });

    const response = await fetch(`${arcgisUrl}?${params}`, {
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.error(`[FranklinAdapter] ArcGIS error: ${response.status} ${response.statusText}`);
      break;
    }

    const data = await response.json() as { features?: Array<{ attributes: Record<string, unknown> }> };

    if (!Array.isArray(data.features) || data.features.length === 0) break;

    if (offset === 0 && data.features.length > 0) {
      console.log('[FranklinAdapter] Sample record keys:', Object.keys(data.features[0]!.attributes));
    }

    for (const feature of data.features) {
      const attrs = feature.attributes;

      const parcel = getField(attrs, 'PARCEL_NUMBER', 'PARCELID', 'PIN', 'parcel_number', 'parcelid');
      if (!parcel) continue;

      const address = getField(attrs, 'PROPERTY_ADDRESS', 'ADDRESS', 'SITUS_ADDRESS', 'LOCATION');
      const city = getField(attrs, 'CITY', 'MUNICIPALITY');
      const zip = getField(attrs, 'ZIP_CODE', 'ZIP', 'ZIPCODE');
      const rawAddress = address
        ? `${address} ${city ?? 'Columbus'} OH${zip ? ` ${zip}` : ''}`.trim()
        : `Parcel ${parcel} Columbus OH`;

      const owner = getField(attrs, 'OWNER_NAME', 'OWNER', 'TAXPAYER_NAME');

      const amountStr = getField(attrs, 'TOTAL_DUE', 'AMOUNT_DUE', 'AMOUNT', 'DELINQUENT_AMOUNT', 'TAX_DUE');
      const amount = amountStr ? parseFloat(amountStr) : undefined;

      const yearStr = getField(attrs, 'TAX_YEAR', 'YEAR', 'DELINQUENT_YEAR');
      const year = yearStr ? parseInt(yearStr, 10) : undefined;
      const currentYear = new Date().getFullYear();
      const yearsDelinquent = year && Number.isFinite(year) ? currentYear - year : undefined;

      records.push({
        rawParcelId: parcel,
        rawAddress,
        ownerName: owner,
        signalType: 'tax_lien',
        amount: amount !== undefined && Number.isFinite(amount) ? amount : undefined,
        dateFiled: year ? `${year}-01-01` : undefined,
        yearsDelinquent,
        source: 'Franklin County Auditor - Tax Delinquent Parcels',
      });
    }

    if (data.features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return records;
}

export class FranklinAdapter extends BaseAdapter {
  countyFips = '39049';
  countyName = 'Franklin County';
  state = 'OH';

  async scrape(): Promise<ScrapedRecord[]> {
    for (const url of ARCGIS_URLS) {
      try {
        const records = await tryFetchFromUrl(url);
        if (records.length > 0) {
          console.log(`[FranklinAdapter] Fetched ${records.length} records from ArcGIS API`);
          return records;
        }
        console.warn(`[FranklinAdapter] Endpoint returned 0 records: ${url}`);
      } catch (err) {
        console.warn(`[FranklinAdapter] Endpoint failed (${url}):`, err);
      }
    }

    console.warn('[FranklinAdapter] All ArcGIS endpoints failed or returned 0 records. Returning empty array.');
    return [];
  }
}
