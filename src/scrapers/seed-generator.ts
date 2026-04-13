import type { ScrapedRecord } from './base-adapter.js';

export interface SeedConfig {
  streets: string[];
  cities: string[];
  state: string;
  zipCodes: string[];
  parcelPrefix: string;
  parcelLength: number;
  countyTaxSource: string;
  countyClerkSource: string;
  countyRecorderSource: string;
  lenders: string[];
  ownerFirstNames: string[];
  ownerLastNames: string[];
}

const PROPERTY_TYPES = ['residential', 'residential', 'residential', 'residential', 'commercial', 'commercial'];

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRand(seed) * arr.length)]!;
}

function randInt(min: number, max: number, seed: number): number {
  return Math.floor(seededRand(seed) * (max - min + 1)) + min;
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function generateSeedRecords(config: SeedConfig, count: number): ScrapedRecord[] {
  const records: ScrapedRecord[] = [];

  for (let i = 0; i < count; i++) {
    const s = i * 17 + 37;

    const signalRoll = seededRand(s);
    let signalType: string;
    if (signalRoll < 0.60) {
      signalType = 'tax_lien';
    } else if (signalRoll < 0.80) {
      signalType = 'lis_pendens';
    } else if (signalRoll < 0.90) {
      signalType = 'notice_of_default';
    } else {
      signalType = 'notice_of_trustee_sale';
    }

    const streetNum = randInt(100, 19900, s + 4);
    const street = pick(config.streets, s + 5);
    const city = pick(config.cities, s + 6);
    const zip = pick(config.zipCodes, s + 6);
    const rawAddress = `${streetNum} ${street} ${city} ${config.state} ${zip}`;

    const ownerFirst = pick(config.ownerFirstNames, s + 7);
    const ownerLast = pick(config.ownerLastNames, s + 8);
    const ownerName = `${ownerLast.toUpperCase()} ${ownerFirst.toUpperCase()}`;

    const propertyType = pick(PROPERTY_TYPES, s + 9);

    const year = randInt(2021, 2024, s + 10);
    const month = randInt(1, 12, s + 11);
    const day = randInt(1, 28, s + 12);
    const dateFiled = formatDate(year, month, day);

    // Generate parcel ID using prefix + padded number
    const parcelNum = randInt(10000000, 99999999, s + 3);
    const rawParcelId = `${config.parcelPrefix}${String(parcelNum).slice(0, config.parcelLength - config.parcelPrefix.length)}`;

    let amount: number;
    let yearsDelinquent: number | undefined;
    let caseNumber: string | undefined;
    let lenderName: string | undefined;
    let auctionDate: string | undefined;

    let source: string;
    if (signalType === 'tax_lien') {
      source = config.countyTaxSource;
      amount = Math.round(seededRand(s + 13) * 79000 + 1000);
      yearsDelinquent = randInt(1, 6, s + 14);
    } else if (signalType === 'lis_pendens') {
      source = config.countyClerkSource;
      amount = Math.round(seededRand(s + 13) * 450000 + 50000);
      caseNumber = `LP-${year}-${String(randInt(1000, 99999, s + 15)).padStart(5, '0')}`;
      lenderName = pick(config.lenders, s + 16);
    } else if (signalType === 'notice_of_default') {
      source = config.countyRecorderSource;
      amount = Math.round(seededRand(s + 13) * 320000 + 80000);
      caseNumber = `NOD-${year}-${String(randInt(1000, 99999, s + 15)).padStart(5, '0')}`;
      lenderName = pick(config.lenders, s + 16);
    } else {
      source = config.countyRecorderSource;
      amount = Math.round(seededRand(s + 13) * 290000 + 60000);
      caseNumber = `NOTS-${year}-${String(randInt(1000, 99999, s + 15)).padStart(5, '0')}`;
      lenderName = pick(config.lenders, s + 16);
      const auctionMonth = month < 12 ? month + 1 : 1;
      const auctionYear = month < 12 ? year : year + 1;
      auctionDate = formatDate(auctionYear, auctionMonth, day);
    }

    records.push({
      rawParcelId,
      rawAddress,
      ownerName,
      propertyType,
      signalType,
      amount,
      dateFiled,
      caseNumber,
      lenderName,
      auctionDate,
      yearsDelinquent,
      source,
    });
  }

  return records;
}
