import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const TREASURER_URL =
  'https://www.clarkcountynv.gov/government/elected_officials/county_treasurer/notice-of-delinquent-taxes-nrs-361-565';

export class ClarkAdapter extends BaseAdapter {
  countyFips = '32003';
  countyName = 'Clark County';
  state = 'NV';

  async scrape(): Promise<ScrapedRecord[]> {
    try {
      const response = await fetch(TREASURER_URL, {
        signal: AbortSignal.timeout(30_000),
        headers: { 'Accept': 'text/html,text/csv,application/octet-stream' },
      });

      if (!response.ok) {
        console.warn(
          `[ClarkAdapter] Could not fetch delinquent tax data from Clark County Treasurer (HTTP ${response.status}). County will show 0 records until data source is resolved.`
        );
        return [];
      }

      const contentType = response.headers.get('content-type') ?? '';
      const text = await response.text();

      // Only attempt CSV parsing if the response looks like tabular data
      if (!contentType.includes('csv') && !text.includes(',')) {
        console.warn(
          '[ClarkAdapter] Could not fetch delinquent tax data from Clark County Treasurer. County will show 0 records until data source is resolved.'
        );
        return [];
      }

      const records: ScrapedRecord[] = [];
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const header = lines[0]?.split(',').map(h => h.trim().toLowerCase()) ?? [];

      const parcelIdx = header.findIndex(h => h.includes('parcel') || h.includes('pin') || h.includes('apn'));
      const ownerIdx = header.findIndex(h => h.includes('owner') || h.includes('taxpayer'));
      const amountIdx = header.findIndex(h => h.includes('amount') || h.includes('due') || h.includes('tax'));
      const addressIdx = header.findIndex(h => h.includes('address') || h.includes('situs'));

      if (parcelIdx === -1) {
        console.warn(
          '[ClarkAdapter] Could not fetch delinquent tax data from Clark County Treasurer. County will show 0 records until data source is resolved.'
        );
        return [];
      }

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i]!.split(',');
        const parcel = cols[parcelIdx]?.trim();
        if (!parcel) continue;

        const owner = ownerIdx >= 0 ? cols[ownerIdx]?.trim() : undefined;
        const address = addressIdx >= 0 ? cols[addressIdx]?.trim() : undefined;
        const amountStr = amountIdx >= 0 ? cols[amountIdx]?.trim() : undefined;
        const amount = amountStr ? parseFloat(amountStr.replace(/[$,]/g, '')) : undefined;

        records.push({
          rawParcelId: parcel,
          rawAddress: address ? `${address} Clark County NV` : `Parcel ${parcel} Clark County NV`,
          ownerName: owner || undefined,
          signalType: 'tax_lien',
          amount: amount !== undefined && Number.isFinite(amount) ? amount : undefined,
          source: 'Clark County Treasurer - Notice of Delinquent Taxes',
        });
      }

      console.log(`[ClarkAdapter] Fetched ${records.length} records from Clark County Treasurer`);
      return records;
    } catch (err) {
      console.warn(
        '[ClarkAdapter] Could not fetch delinquent tax data from Clark County Treasurer. County will show 0 records until data source is resolved.',
        err
      );
      return [];
    }
  }
}
