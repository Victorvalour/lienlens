import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const SOCRATA_URL = 'https://datacatalog.cookcountyil.gov/resource/55ju-2fs9.json';
const PAGE_SIZE = 1000;

interface SocrataRecord {
  /* PIN / parcel identifier */
  pin?: string;
  pin_number?: string;
  property_index_number?: string;
  /* tax year */
  tax_year?: string;
  year?: string;
  /* amount */
  delinquent_tax_amount?: string;
  total_due?: string;
  amount_due?: string;
  tax_amount?: string;
  /* address */
  property_address?: string;
  address?: string;
  mailing_address?: string;
  /* city */
  city?: string;
  municipality?: string;
  /* state / zip */
  state?: string;
  zip?: string;
  zip_code?: string;
  /* owner */
  owner_name?: string;
  taxpayer_name?: string;
  assessee_name?: string;
  /* additional fields */
  volume?: string;
  classification?: string;
  interest?: string;
  status?: string;
  [key: string]: string | undefined;
}

/** Return the first non-empty value found among the candidate keys. */
function getField(row: SocrataRecord, ...candidates: string[]): string | undefined {
  for (const key of candidates) {
    const val = row[key];
    if (val !== undefined && val !== null && val !== '') {
      return String(val);
    }
  }
  return undefined;
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
          const pin = getField(row, 'pin', 'pin_number', 'property_index_number') ?? '';
          if (!pin) continue;

          const addressParts: string[] = [];
          const streetAddr = getField(row, 'property_address', 'address', 'mailing_address');
          const cityName   = getField(row, 'city', 'municipality');
          if (streetAddr) addressParts.push(streetAddr);
          if (cityName)   addressParts.push(cityName);
          addressParts.push(getField(row, 'state') ?? 'IL');
          const zipCode = getField(row, 'zip', 'zip_code');
          if (zipCode) addressParts.push(zipCode);
          const rawAddress = addressParts.length > 1
            ? addressParts.join(' ')
            : `PIN ${pin} Chicago IL`;

          const amountRaw = getField(row, 'delinquent_tax_amount', 'total_due', 'amount_due', 'tax_amount');
          const totalDue  = amountRaw ? parseFloat(amountRaw) : undefined;
          const taxYearRaw = getField(row, 'tax_year', 'year');
          const taxYear    = taxYearRaw ? parseInt(taxYearRaw, 10) : undefined;
          const currentYear = new Date().getFullYear();
          const yearsDelinquent = taxYear && taxYear > 0
            ? currentYear - taxYear
            : undefined;

          records.push({
            rawParcelId: pin,
            rawAddress,
            ownerName: getField(row, 'owner_name', 'taxpayer_name', 'assessee_name'),
            propertyType: 'residential',
            signalType: 'tax_lien',
            amount: totalDue !== undefined && Number.isFinite(totalDue) ? totalDue : undefined,
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
