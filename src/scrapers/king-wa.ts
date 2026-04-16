import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const DELINQUENT_URL = 'https://data.kingcounty.gov/resource/dsv3-ct3e.json';
const FORECLOSURE_URL = 'https://data.kingcounty.gov/resource/nx4x-daw6.json';
const PAGE_SIZE = 1000;

function getField(record: Record<string, unknown>, ...candidates: string[]): string | undefined {
  for (const key of candidates) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== '') {
      return String(record[key]);
    }
    const upper = key.toUpperCase();
    if (record[upper] !== undefined && record[upper] !== null && record[upper] !== '') {
      return String(record[upper]);
    }
    const lower = key.toLowerCase();
    if (record[lower] !== undefined && record[lower] !== null && record[lower] !== '') {
      return String(record[lower]);
    }
  }
  return undefined;
}

async function fetchAllPages(
  url: string,
  adapterName: string
): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let offset = 0;

  while (true) {
    const pageUrl = `${url}?$limit=${PAGE_SIZE}&$offset=${offset}`;
    const response = await fetch(pageUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.error(`[${adapterName}] API error: ${response.status} ${response.statusText}`);
      break;
    }

    const batch = await response.json() as Record<string, unknown>[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    if (offset === 0 && batch.length > 0) {
      console.log(`[${adapterName}] Sample record keys:`, Object.keys(batch[0]!));
    }

    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return all;
}

export class KingAdapter extends BaseAdapter {
  countyFips = '53033';
  countyName = 'King County';
  state = 'WA';

  async scrape(): Promise<ScrapedRecord[]> {
    const records: ScrapedRecord[] = [];

    try {
      // Dataset 1: Delinquent Taxes
      const delinquentRows = await fetchAllPages(DELINQUENT_URL, 'KingAdapter/DelinquentTaxes');
      for (const row of delinquentRows) {
        const parcel = getField(row, 'parcel', 'parcel_number', 'pin');
        if (!parcel) continue;

        const amountStr = getField(row, 'distribution_amt', 'amount', 'tax_amount', 'total_due');
        const amount = amountStr ? parseFloat(amountStr) : undefined;

        const taxYear = getField(row, 'tax_yr', 'tax_year', 'year');
        const currentYear = new Date().getFullYear();
        const year = taxYear ? parseInt(taxYear, 10) : undefined;
        const yearsDelinquent = year && Number.isFinite(year) ? currentYear - year : undefined;

        const owner = getField(row, 'taxpayer_name', 'owner_name', 'owner');

        records.push({
          rawParcelId: parcel,
          rawAddress: `Parcel ${parcel} King County WA`,
          ownerName: owner,
          signalType: 'tax_lien',
          amount: amount !== undefined && Number.isFinite(amount) ? amount : undefined,
          dateFiled: year ? `${year}-01-01` : undefined,
          yearsDelinquent,
          source: 'King County Treasury Operations',
        });
      }

      // Dataset 2: Foreclosure Parcels
      const foreclosureRows = await fetchAllPages(FORECLOSURE_URL, 'KingAdapter/ForeclosureParcels');
      for (const row of foreclosureRows) {
        const parcel = getField(row, 'parcel', 'parcel_number', 'pin', 'major', 'minor');
        if (!parcel) continue;

        const address = getField(row, 'address', 'property_address', 'situs_address');
        const rawAddress = address ? `${address} King County WA` : `Parcel ${parcel} King County WA`;

        const amountStr = getField(row, 'amount', 'total_due', 'amount_due');
        const amount = amountStr ? parseFloat(amountStr) : undefined;

        records.push({
          rawParcelId: parcel,
          rawAddress,
          signalType: 'notice_of_default',
          amount: amount !== undefined && Number.isFinite(amount) ? amount : undefined,
          source: 'King County Treasury Operations',
        });
      }
    } catch (err) {
      console.error('[KingAdapter] Failed to fetch King County data:', err);
    }

    console.log(`[KingAdapter] Fetched ${records.length} records from King County APIs`);
    return records;
  }
}
