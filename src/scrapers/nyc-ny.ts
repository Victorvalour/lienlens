import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const SOCRATA_URL = 'https://data.cityofnewyork.us/resource/9rz4-mjek.json';
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

export class NYCAdapter extends BaseAdapter {
  countyFips = '36061';
  countyName = 'New York City';
  state = 'NY';

  async scrape(): Promise<ScrapedRecord[]> {
    const records: ScrapedRecord[] = [];
    let offset = 0;

    try {
      while (true) {
        const url = `${SOCRATA_URL}?$limit=${PAGE_SIZE}&$offset=${offset}`;
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(30_000),
        });

        if (!response.ok) {
          console.error(`[NYCAdapter] Socrata API error: ${response.status} ${response.statusText}`);
          break;
        }

        const batch = await response.json() as Record<string, unknown>[];
        if (!Array.isArray(batch) || batch.length === 0) break;

        if (offset === 0 && batch.length > 0) {
          console.log('[NYCAdapter] Sample record keys:', Object.keys(batch[0]!));
          console.log('[NYCAdapter] Sample record:', JSON.stringify(batch[0]).slice(0, 500));
        }

        for (const row of batch) {
          const bbl = getField(row, 'bbl', 'borough_block_lot', 'parcel');
          if (!bbl) continue;

          const address = getField(row, 'property_address', 'address', 'street_address');
          const borough = getField(row, 'borough');
          const zip = getField(row, 'zip_code', 'zipcode', 'zip');
          const rawAddress = address
            ? `${address} ${borough ?? ''} NY ${zip ?? ''}`.trim()
            : `BBL ${bbl} New York NY`;

          const amountStr = getField(row, 'tax_amount', 'amount', 'amount_due', 'ease_amount', 'total_due');
          const amount = amountStr ? parseFloat(amountStr) : undefined;

          const taxClass = getField(row, 'tax_class');
          const owner = getField(row, 'owner_name', 'owner', 'taxpayer_name');

          records.push({
            rawParcelId: bbl,
            rawAddress,
            ownerName: owner,
            signalType: 'tax_lien',
            amount: amount !== undefined && Number.isFinite(amount) ? amount : undefined,
            source: 'NYC Department of Finance - Tax Lien Sale List',
            propertyType: taxClass?.startsWith('4') ? 'commercial' : 'residential',
          });
        }

        if (batch.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }
    } catch (err) {
      console.error('[NYCAdapter] Failed to fetch Socrata data:', err);
    }

    console.log(`[NYCAdapter] Fetched ${records.length} records from Socrata API`);
    return records;
  }
}
