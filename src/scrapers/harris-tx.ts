// Seed data — Harris County does not offer public bulk data API. Replace with real scraping when bulk access is obtained via Texas Public Information Act request.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';

const HOUSTON_STREETS = [
  'Main St', 'Westheimer Rd', 'Kirby Dr', 'Montrose Blvd', 'Navigation Blvd',
  'Bellaire Blvd', 'Heights Blvd', 'Shepherd Dr', 'Almeda Rd', 'Fondren Rd',
  'Beechnut St', 'Telephone Rd', 'Lyons Ave', 'Dowling St', 'Lamar St',
  'Travis St', 'MacGregor Way', 'Gulf Freeway', 'Gessner Rd', 'Antoine Dr',
  'Braeswood Blvd', 'Bissonnet St', 'Richmond Ave', 'Hillcroft Ave', 'Harwin Dr',
  'Cullen Blvd', 'Scott St', 'OST', 'Griggs Rd', 'Lawndale St',
  'Tidwell Rd', 'Little York Rd', 'Airline Dr', 'Yale St', 'Durham Dr',
  'Shepherd Dr', 'Studemont St', 'Westpark Dr', 'South Loop W', 'North Loop W',
  'Holcombe Blvd', 'Fannin St', 'Greenbriar Dr', 'Buffalo Speedway', 'S Post Oak Rd',
  'W Fuqua St', 'Reed Rd', 'Holmes Rd', 'Mykawa Rd', 'Schurmier Rd',
];

const HOUSTON_ZIPS = [
  '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009',
  '77011', '77012', '77013', '77016', '77017', '77018', '77019', '77020',
  '77021', '77022', '77023', '77025', '77028', '77030', '77033', '77034',
  '77035', '77036', '77040', '77041', '77042', '77043', '77045', '77047',
  '77048', '77050', '77051', '77054', '77055', '77056', '77057', '77058',
  '77061', '77063', '77065', '77066', '77067', '77071', '77072', '77074',
  '77077', '77079', '77080', '77081', '77082', '77083', '77084', '77085',
  '77086', '77087', '77088', '77089', '77090', '77091', '77092', '77093',
  '77094', '77095', '77096', '77098', '77099', '77401', '77502', '77504',
];

const OWNER_FIRST = [
  'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
  'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
  'Charles', 'Lisa', 'Daniel', 'Betty', 'Matthew', 'Dorothy', 'Anthony', 'Sandra',
  'Donald', 'Ashley', 'Mark', 'Sarah', 'Paul', 'Kimberly', 'Steven', 'Donna',
  'Andrew', 'Emily', 'Kenneth', 'Michelle', 'Joshua', 'Carol', 'George', 'Amanda',
  'Kevin', 'Melissa', 'Brian', 'Deborah', 'Edward', 'Stephanie', 'Ronald', 'Rebecca',
  'Timothy', 'Sharon', 'Jason', 'Laura', 'Jeffrey', 'Cynthia', 'Ryan', 'Kathleen',
  'Jacob', 'Amy', 'Gary', 'Angela', 'Nicholas', 'Shirley', 'Eric', 'Brenda',
  'Jonathan', 'Emma', 'Stephen', 'Anna', 'Larry', 'Pamela', 'Justin', 'Emma',
  'Scott', 'Virginia', 'Brandon', 'Katherine', 'Frank', 'Christine', 'Raymond', 'Samantha',
  'Thanh', 'Hien', 'Van', 'Minh', 'Lan', 'Tran', 'Nguyen', 'Le',
  'Miguel', 'Elena', 'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa',
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
];

const OWNER_LAST = [
  'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
  'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
  'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall',
  'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott',
  'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez',
  'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins',
  'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell',
  'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward',
  'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly',
  'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman',
  'Nguyen', 'Tran', 'Pham', 'Le', 'Vo', 'Vu', 'Dang', 'Bui',
  'Patel', 'Shah', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Mehta',
];

const LENDERS = [
  'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
  'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
  'Caliber Home Loans', 'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA',
  'United Wholesale Mortgage', 'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing',
  'Selene Finance', 'PHH Mortgage', 'SLS Specialized Loan Servicing', 'Mr Cooper',
  'Flagstar Bank', 'Guaranteed Rate Inc', 'Movement Mortgage', 'Guild Mortgage',
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
  const p1 = String(randInt(1000, 9999, seed + 1)).padStart(4, '0');
  const p2 = String(randInt(1000, 9999, seed + 2)).padStart(4, '0');
  const p3 = String(randInt(10000, 99999, seed + 3)).padStart(5, '0');
  return `${p1}${p2}${p3}`;
}

function generateHarrisRecords(): ScrapedRecord[] {
  const records: ScrapedRecord[] = [];

  for (let i = 0; i < 220; i++) {
    const s = i * 17 + 31;
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

    const streetNum = randInt(100, 19900, s + 4);
    const street = pick(HOUSTON_STREETS, s + 5);
    const zip = pick(HOUSTON_ZIPS, s + 6);
    const rawAddress = `${streetNum} ${street} Houston TX ${zip}`;

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
      ? 'Harris County Tax Assessor'
      : 'Harris County District Clerk';

    if (signalType === 'tax_lien') {
      amount = Math.round(seededRand(s + 13) * 79000 + 1000);
      yearsDelinquent = randInt(1, 6, s + 14);
    } else if (signalType === 'lis_pendens') {
      amount = Math.round(seededRand(s + 13) * 450000 + 50000);
      caseNumber = `LP-${year}-${String(randInt(1000, 99999, s + 15)).padStart(5, '0')}`;
      lenderName = pick(LENDERS, s + 16);
    } else if (signalType === 'notice_of_default') {
      amount = Math.round(seededRand(s + 13) * 320000 + 80000);
      caseNumber = `NOD-${year}-${String(randInt(1000, 99999, s + 15)).padStart(5, '0')}`;
      lenderName = pick(LENDERS, s + 16);
    } else {
      amount = Math.round(seededRand(s + 13) * 290000 + 60000);
      caseNumber = `NOTS-${year}-${String(randInt(1000, 99999, s + 15)).padStart(5, '0')}`;
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

export class HarrisAdapter extends BaseAdapter {
  countyFips = '48201';
  countyName = 'Harris County';
  state = 'TX';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateHarrisRecords();
  }
}
