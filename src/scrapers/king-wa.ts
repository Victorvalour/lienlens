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

async function fetchWithRetry(url: string, adapterName: string): Promise<Response> {
  let response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 500) {
    console.warn(`[${adapterName}] Got 500, retrying once...`);
    response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
  }
  return response;
}

async function fetchAllPages(
  url: string,
  adapterName: string
): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let offset = 0;

  while (true) {
    const pageUrl = `${url}?$limit=${PAGE_SIZE}&$offset=${offset}`;
    let response: Response;
    try {
      response = await fetchWithRetry(pageUrl, adapterName);
    } catch (err) {
      console.error(`[${adapterName}] Fetch error:`, err);
      break;
    }

    if (!response.ok) {
      console.error(`[${adapterName}] API error: ${response.status} ${response.statusText}`);
      break;
    }

    const raw = await response.json() as unknown;

    // Handle nested response: { parcels: [...] } or flat array
    let batch: Record<string, unknown>[];
    if (Array.isArray(raw)) {
      batch = raw as Record<string, unknown>[];
    } else if (raw && typeof raw === 'object' && 'parcels' in (raw as object)) {
      const nested = (raw as { parcels: unknown }).parcels;
      batch = Array.isArray(nested) ? nested as Record<string, unknown>[] : [];
    } else {
      batch = [];
    }

    if (batch.length === 0) break;

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
        const parcel = getField(row, 'account_number');
        if (!parcel) continue;

        const taxStatus = getField(row, 'tax_status');
        if (taxStatus && (taxStatus === 'Paid' || taxStatus === 'Current')) continue;

        const billedStr = getField(row, 'billed_amount');
        const paidStr = getField(row, 'paid_amount');
        let amount: number | undefined;
        if (billedStr) {
          const billed = parseFloat(billedStr);
          if (Number.isFinite(billed)) {
            const paid = paidStr ? parseFloat(paidStr) : 0;
            amount = billed - (Number.isFinite(paid) ? paid : 0);
          }
        }

        const taxYear = getField(row, 'bill_year');
        const currentYear = new Date().getFullYear();
        const year = taxYear ? parseInt(taxYear, 10) : undefined;
        const yearsDelinquent = year && Number.isFinite(year) ? currentYear - year : undefined;

        records.push({
          rawParcelId: parcel,
          rawAddress: `Account ${parcel} King County WA`,
          ownerName: undefined,
          signalType: 'tax_lien',
          amount: amount !== undefined && Number.isFinite(amount) ? amount : undefined,
          dateFiled: year ? `${year}-01-01` : undefined,
          yearsDelinquent,
          source: 'King County Treasury - Delinquent Taxes',
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
          source: 'King County Treasury - Foreclosure Parcels',
        });
      }
    } catch (err) {
      console.error('[KingAdapter] Failed to fetch King County data:', err);
    }

    console.log(`[KingAdapter] Fetched ${records.length} records from King County APIs`);
    return records;
  }
}
