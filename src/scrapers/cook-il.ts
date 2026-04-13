import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const SOCRATA_URL = 'https://datacatalog.cookcountyil.gov/resource/55ju-2fs9.json';
const PAGE_SIZE = 1000;

interface SocrataRecord {
  tax_sale_year?: string;
  pin?: string;
  classification?: string;
  township_name?: string;
  sold_at_sale?: boolean | string;
  tax_amount_offered?: string;
  penalty_amount_offered?: string;
  total_tax_and_penalty_amount_offered?: string;
  cost?: string;
  total_amount_forfeited?: string;
  location_1?: { latitude?: string; longitude?: string } | string;
  [key: string]: unknown;
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

        if (offset === 0 && batch.length > 0) {
          console.log('[CookAdapter] Sample record keys:', Object.keys(batch[0]));
          console.log('[CookAdapter] Sample record:', JSON.stringify(batch[0]).slice(0, 500));
        }

        for (const row of batch) {
          const pin = row.pin ?? '';
          if (!pin) continue;

          // Amount — use total_amount_forfeited (tax + penalty + cost)
          const amountStr = row.total_amount_forfeited ?? row.total_tax_and_penalty_amount_offered ?? row.tax_amount_offered;
          const amount = amountStr ? parseFloat(amountStr as string) : undefined;

          // Tax year and years delinquent
          const taxSaleYear = row.tax_sale_year ? parseInt(row.tax_sale_year, 10) : undefined;
          const currentYear = new Date().getFullYear();
          const yearsDelinquent = taxSaleYear && taxSaleYear > 0 ? currentYear - taxSaleYear : undefined;

          // Address — no street address in this dataset, use township
          const township = row.township_name ?? 'CHICAGO';
          const rawAddress = `PIN ${pin} ${township} IL`;

          // Property type from classification code
          let propertyType = 'residential';
          const classCode = row.classification ?? '';
          if ((classCode as string).startsWith('5') || (classCode as string).startsWith('3')) {
            propertyType = 'commercial';
          } else if ((classCode as string).startsWith('1')) {
            propertyType = 'land';
          }

          records.push({
            rawParcelId: pin,
            rawAddress,
            ownerName: undefined,
            propertyType,
            signalType: 'tax_lien',
            amount: Number.isFinite(amount) ? amount : undefined,
            dateFiled: taxSaleYear ? `${taxSaleYear}-01-01` : undefined,
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
