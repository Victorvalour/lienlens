import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const SOCRATA_URL = 'https://datacatalog.cookcountyil.gov/resource/55ju-2fs9.json';
const PAGE_SIZE = 1000;

interface SocrataRecord {
  pin?: string;
  tax_year?: string;
  total_due?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  taxpayer_name?: string;
  /* additional fields that may be present */
  [key: string]: string | undefined;
}

export class CookAdapter extends BaseAdapter {
  countyFips = '17031';
  countyName = 'Cook County';
  state = 'IL';

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
          console.error(`[CookAdapter] Socrata API error: ${response.status} ${response.statusText}`);
          break;
        }

        const batch: SocrataRecord[] = await response.json() as SocrataRecord[];
        if (!Array.isArray(batch) || batch.length === 0) break;

        for (const row of batch) {
          const pin = row['pin'] ?? '';
          if (!pin) continue;

          const addressParts: string[] = [];
          if (row['address']) addressParts.push(row['address']);
          if (row['city'])    addressParts.push(row['city']);
          if (row['state'])   addressParts.push(row['state']);
          else                addressParts.push('IL');
          if (row['zip'])     addressParts.push(row['zip']);
          const rawAddress = addressParts.length > 1
            ? addressParts.join(' ')
            : `PIN ${pin} Chicago IL`;

          const totalDue = row['total_due'] ? parseFloat(row['total_due']) : undefined;
          const taxYear  = row['tax_year']  ? parseInt(row['tax_year'], 10) : undefined;
          const currentYear = new Date().getFullYear();
          const yearsDelinquent = taxYear && taxYear > 0
            ? currentYear - taxYear
            : undefined;

          records.push({
            rawParcelId: pin,
            rawAddress,
            ownerName: row['taxpayer_name'] ?? undefined,
            propertyType: 'residential',
            signalType: 'tax_lien',
            amount: Number.isFinite(totalDue) ? totalDue : undefined,
            dateFiled: taxYear ? `${taxYear}-01-01` : undefined,
            yearsDelinquent,
            source: 'Cook County Treasurer - Annual Tax Sale',
          });
        }

        if (batch.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }
    } catch (err) {
      console.error('[CookAdapter] Failed to fetch Socrata data:', err);
    }

    console.log(`[CookAdapter] Fetched ${records.length} records from Socrata API`);
    return records;
  }
}
