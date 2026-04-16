import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const SOCRATA_URL = 'https://data.cityofnewyork.us/resource/9rz4-mjek.json';
const PAGE_SIZE = 1000;

const BOROUGH_NAMES: Record<string, string> = {
  '1': 'Manhattan',
  '2': 'Bronx',
  '3': 'Brooklyn',
  '4': 'Queens',
  '5': 'Staten Island',
};

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

function classifyBuildingClass(buildingClass: string | undefined): 'residential' | 'commercial' {
  if (!buildingClass) return 'residential';
  const first = buildingClass[0]?.toUpperCase() ?? '';
  if ('ABCDRS'.includes(first)) return 'residential';
  if ('EFGHIJKLO'.includes(first)) return 'commercial';
  return 'residential';
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
          const boroughNum = getField(row, 'borough') ?? '';
          const blockRaw = getField(row, 'block') ?? '';
          const lotRaw = getField(row, 'lot') ?? '';

          if (!boroughNum || !blockRaw || !lotRaw) continue;

          const bbl = `${boroughNum}${blockRaw.padStart(5, '0')}${lotRaw.padStart(4, '0')}`;

          const houseNumber = getField(row, 'house_number') ?? '';
          const streetName = getField(row, 'street_name') ?? '';
          const zip = getField(row, 'zip_code', 'zipcode', 'zip') ?? '';
          const boroughName = BOROUGH_NAMES[boroughNum] ?? 'New York';
          const rawAddress = `${houseNumber} ${streetName} ${boroughName} NY ${zip}`.trim();

          const buildingClass = getField(row, 'building_class');
          const propertyType = classifyBuildingClass(buildingClass);

          const monthRaw = getField(row, 'month');
          const dateFiled = monthRaw ? monthRaw.slice(0, 10) : undefined;

          records.push({
            rawParcelId: bbl,
            rawAddress,
            ownerName: undefined,
            signalType: 'tax_lien',
            amount: undefined,
            dateFiled,
            source: 'NYC Department of Finance - Tax Lien Sale List',
            propertyType,
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
