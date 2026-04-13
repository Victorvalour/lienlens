// Seed data — Maricopa County does not offer public bulk data API. Replace with real scraping when bulk access is obtained via Arizona public records request.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const MARICOPA_STREETS = [
  'E McDowell Rd', 'W Camelback Rd', 'N 7th Ave', 'S Central Ave', 'E Thomas Rd',
  'S Mill Ave', 'W Indian School Rd', 'E Camelback Rd', 'W Bethany Home Rd', 'E Southern Ave',
  'W Peoria Ave', 'S Rural Rd', 'E Baseline Rd', 'W Thunderbird Rd', 'E Van Buren St',
  'W Guadalupe Rd', 'S Dobson Rd', 'N 51st Ave', 'E Osborn Rd', 'E Apache Blvd',
  'N Scottsdale Rd', 'E Shea Blvd', 'W Bell Rd', 'N 19th Ave', 'E Chandler Blvd',
  'W Ray Rd', 'S Gilbert Rd', 'N Cave Creek Rd', 'E University Dr', 'W Olive Ave',
  'S 48th St', 'N 75th Ave', 'E Warner Rd', 'W Glendale Ave', 'S Arizona Ave',
  'N Dysart Rd', 'E Elliot Rd', 'W Buckeye Rd', 'S Power Rd', 'N 32nd St',
  'E Greenway Rd', 'W Deer Valley Rd', 'S Country Club Dr', 'N 43rd Ave', 'E Riggs Rd',
  'W Pinnacle Peak Rd', 'S Alma School Rd', 'N 67th Ave', 'E Williams Field Rd', 'W Pecos Rd',
];

interface CityZip { city: string; zip: string; }

const MARICOPA_CITIES: CityZip[] = [
  { city: 'Phoenix', zip: '85001' }, { city: 'Phoenix', zip: '85003' }, { city: 'Phoenix', zip: '85004' },
  { city: 'Phoenix', zip: '85006' }, { city: 'Phoenix', zip: '85007' }, { city: 'Phoenix', zip: '85008' },
  { city: 'Phoenix', zip: '85009' }, { city: 'Phoenix', zip: '85012' }, { city: 'Phoenix', zip: '85013' },
  { city: 'Phoenix', zip: '85014' }, { city: 'Phoenix', zip: '85015' }, { city: 'Phoenix', zip: '85016' },
  { city: 'Phoenix', zip: '85017' }, { city: 'Phoenix', zip: '85018' }, { city: 'Phoenix', zip: '85019' },
  { city: 'Phoenix', zip: '85021' }, { city: 'Phoenix', zip: '85022' }, { city: 'Phoenix', zip: '85023' },
  { city: 'Phoenix', zip: '85029' }, { city: 'Phoenix', zip: '85031' }, { city: 'Phoenix', zip: '85032' },
  { city: 'Phoenix', zip: '85033' }, { city: 'Phoenix', zip: '85034' }, { city: 'Phoenix', zip: '85035' },
  { city: 'Phoenix', zip: '85037' }, { city: 'Phoenix', zip: '85040' }, { city: 'Phoenix', zip: '85041' },
  { city: 'Phoenix', zip: '85042' }, { city: 'Phoenix', zip: '85043' }, { city: 'Phoenix', zip: '85044' },
  { city: 'Phoenix', zip: '85045' }, { city: 'Phoenix', zip: '85048' }, { city: 'Phoenix', zip: '85050' },
  { city: 'Phoenix', zip: '85051' }, { city: 'Phoenix', zip: '85053' }, { city: 'Phoenix', zip: '85054' },
  { city: 'Tempe', zip: '85281' }, { city: 'Tempe', zip: '85282' }, { city: 'Tempe', zip: '85283' },
  { city: 'Tempe', zip: '85284' }, { city: 'Mesa', zip: '85201' }, { city: 'Mesa', zip: '85202' },
  { city: 'Mesa', zip: '85203' }, { city: 'Mesa', zip: '85204' }, { city: 'Mesa', zip: '85205' },
  { city: 'Mesa', zip: '85206' }, { city: 'Mesa', zip: '85207' }, { city: 'Mesa', zip: '85208' },
  { city: 'Mesa', zip: '85209' }, { city: 'Mesa', zip: '85210' }, { city: 'Mesa', zip: '85212' },
  { city: 'Scottsdale', zip: '85250' }, { city: 'Scottsdale', zip: '85251' }, { city: 'Scottsdale', zip: '85253' },
  { city: 'Scottsdale', zip: '85254' }, { city: 'Scottsdale', zip: '85255' }, { city: 'Scottsdale', zip: '85257' },
  { city: 'Scottsdale', zip: '85258' }, { city: 'Scottsdale', zip: '85259' }, { city: 'Scottsdale', zip: '85260' },
  { city: 'Scottsdale', zip: '85262' }, { city: 'Chandler', zip: '85224' }, { city: 'Chandler', zip: '85225' },
  { city: 'Chandler', zip: '85226' }, { city: 'Chandler', zip: '85248' }, { city: 'Gilbert', zip: '85233' },
  { city: 'Gilbert', zip: '85234' }, { city: 'Gilbert', zip: '85295' }, { city: 'Gilbert', zip: '85296' },
  { city: 'Glendale', zip: '85301' }, { city: 'Glendale', zip: '85302' }, { city: 'Glendale', zip: '85303' },
  { city: 'Glendale', zip: '85304' }, { city: 'Glendale', zip: '85305' }, { city: 'Glendale', zip: '85306' },
  { city: 'Glendale', zip: '85307' }, { city: 'Glendale', zip: '85308' }, { city: 'Glendale', zip: '85310' },
  { city: 'Peoria', zip: '85345' }, { city: 'Peoria', zip: '85380' }, { city: 'Peoria', zip: '85381' },
  { city: 'Peoria', zip: '85382' }, { city: 'Peoria', zip: '85383' }, { city: 'Surprise', zip: '85374' },
  { city: 'Surprise', zip: '85379' }, { city: 'Avondale', zip: '85323' }, { city: 'Goodyear', zip: '85338' },
  { city: 'Buckeye', zip: '85326' }, { city: 'Tolleson', zip: '85353' }, { city: 'El Mirage', zip: '85335' },
];

const OWNER_FIRST = [
  'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
  'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
  'Charles', 'Lisa', 'Daniel', 'Betty', 'Matthew', 'Dorothy', 'Anthony', 'Sandra',
  'Donald', 'Ashley', 'Mark', 'Sarah', 'Paul', 'Kimberly', 'Steven', 'Donna',
  'Andrew', 'Emily', 'Kenneth', 'Michelle', 'Joshua', 'Carol', 'George', 'Amanda',
  'Kevin', 'Melissa', 'Brian', 'Deborah', 'Edward', 'Stephanie', 'Ronald', 'Rebecca',
  'Timothy', 'Sharon', 'Jason', 'Laura', 'Jeffrey', 'Cynthia', 'Ryan', 'Kathleen',
  'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
];

const OWNER_LAST = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Patel', 'Shah', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Mehta', 'Desai',
];

const LENDERS = [
  'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
  'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
  'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA', 'United Wholesale Mortgage',
  'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing', 'Arizona Mortgage Group',
  'Pinnacle Bank', 'Movement Mortgage', 'Guild Mortgage', 'Guaranteed Rate Inc',
  'Caliber Home Loans', 'PHH Mortgage', 'Mr Cooper', 'Flagstar Bank',
];

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

function generateParcelId(index: number, seed: number): string {
  const p1 = String(randInt(100, 999, seed + 1)).padStart(3, '0');
  const p2 = String(randInt(100, 999, seed + 2)).padStart(3, '0');
  const p3 = String(randInt(100, 999, seed + 3)).padStart(3, '0');
  return `${p1}${p2}${p3}`;
}

function generateMaricopaRecords(): ScrapedRecord[] {
  const records: ScrapedRecord[] = [];

  for (let i = 0; i < 220; i++) {
    const s = i * 19 + 43;
    const signalRoll = seededRand(s);
    let signalType: string;
    if (signalRoll < 0.60) {
      signalType = 'tax_lien';
    } else if (signalRoll < 0.85) {
      signalType = 'lis_pendens';
    } else if (signalRoll < 0.95) {
      signalType = 'notice_of_default';
    } else {
      signalType = 'notice_of_trustee_sale';
    }

    const streetNum = randInt(100, 15900, s + 4);
    const street = pick(MARICOPA_STREETS, s + 5);
    const cityZip = pick(MARICOPA_CITIES, s + 6);
    const rawAddress = `${streetNum} ${street} ${cityZip.city} AZ ${cityZip.zip}`;

    const ownerFirst = pick(OWNER_FIRST, s + 7);
    const ownerLast = pick(OWNER_LAST, s + 8);
    const ownerName = `${ownerLast.toUpperCase()} ${ownerFirst.toUpperCase()}`;

    const propertyType = pick(PROPERTY_TYPES, s + 9);

    const year = randInt(2021, 2024, s + 10);
    const month = randInt(1, 12, s + 11);
    const day = randInt(1, 28, s + 12);
    const dateFiled = formatDate(year, month, day);

    const rawParcelId = generateParcelId(i, s);

    let amount: number;
    let yearsDelinquent: number | undefined;
    let caseNumber: string | undefined;
    let lenderName: string | undefined;
    let auctionDate: string | undefined;

    const source: string = signalType === 'tax_lien'
      ? 'Maricopa County Treasurer'
      : signalType === 'lis_pendens'
        ? 'Maricopa County Superior Court'
        : 'Maricopa County Recorder';

    if (signalType === 'tax_lien') {
      amount = Math.round(seededRand(s + 13) * 79000 + 1000);
      yearsDelinquent = randInt(1, 6, s + 14);
    } else if (signalType === 'lis_pendens') {
      amount = Math.round(seededRand(s + 13) * 450000 + 50000);
      caseNumber = `LP-${year}-MC-${String(randInt(1000, 99999, s + 15)).padStart(5, '0')}`;
      lenderName = pick(LENDERS, s + 16);
    } else if (signalType === 'notice_of_default') {
      amount = Math.round(seededRand(s + 13) * 320000 + 80000);
      caseNumber = `NOD-${year}-MC-${String(randInt(1000, 99999, s + 15)).padStart(5, '0')}`;
      lenderName = pick(LENDERS, s + 16);
    } else {
      amount = Math.round(seededRand(s + 13) * 290000 + 60000);
      caseNumber = `NOTS-${year}-MC-${String(randInt(1000, 99999, s + 15)).padStart(5, '0')}`;
      lenderName = pick(LENDERS, s + 16);
      const auctionMonth = month < 12 ? month + 1 : 1;
      const auctionYear  = month < 12 ? year : year + 1;
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

export class MaricopaAdapter extends BaseAdapter {
  countyFips = '04013';
  countyName = 'Maricopa County';
  state = 'AZ';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateMaricopaRecords();
  }
}
