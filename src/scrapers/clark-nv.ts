// Seed data — Clark County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Las Vegas Blvd', 'Fremont St', 'Charleston Blvd', 'Sahara Ave', 'Desert Inn Rd',
    'Flamingo Rd', 'Tropicana Ave', 'Hacienda Ave', 'Russell Rd', 'Sunset Rd',
    'Warm Springs Rd', 'Craig Rd', 'Cheyenne Ave', 'Carey Ave', 'Lake Mead Blvd',
    'Owens Ave', 'Bonanza Rd', 'Washington Ave', 'Stewart Ave', 'Ogden Ave',
    'Jones Blvd', 'Durango Dr', 'Rainbow Blvd', 'Decatur Blvd', 'Valley View Blvd',
    'Nellis Blvd', 'Pecos Rd', 'Sandhill Rd', 'Lamb Blvd', 'Losee Rd',
    'Boulder Hwy', 'Stephanie St', 'Eastern Ave', 'Green Valley Pkwy', 'Sunset Rd',
    'Horizon Ridge Pkwy', 'Gibson Rd', 'Windmill Ln', 'Patrick Ln', 'Serene Ave',
  ],
  cities: [
    'Las Vegas', 'Las Vegas', 'Las Vegas', 'Las Vegas', 'Las Vegas',
    'Henderson', 'North Las Vegas', 'Paradise', 'Spring Valley', 'Sunrise Manor',
    'Enterprise', 'Boulder City', 'Mesquite', 'Jean', 'Laughlin',
  ],
  state: 'NV',
  zipCodes: [
    '89002', '89005', '89011', '89012', '89014', '89015', '89030', '89031', '89032', '89044',
    '89052', '89074', '89101', '89102', '89103', '89104', '89106', '89107', '89108', '89109',
    '89110', '89115', '89117', '89118', '89119', '89120', '89121', '89122', '89123', '89124',
    '89128', '89129', '89130', '89131', '89134', '89135', '89138', '89139', '89141', '89142',
    '89143', '89144', '89145', '89146', '89147', '89148', '89149', '89156', '89158', '89161',
    '89162', '89163', '89166', '89169', '89170', '89173', '89177', '89178', '89179', '89183',
    '89191', '89193', '89195', '89196', '89197', '89198', '89199', '89001', '89003', '89004',
    '89006', '89007', '89008', '89009', '89010', '89013', '89016', '89017', '89018', '89019',
  ],
  parcelPrefix: '',
  parcelLength: 11,
  countyTaxSource: 'Clark County Treasurer',
  countyClerkSource: 'Clark County District Court Clerk',
  countyRecorderSource: 'Clark County Recorder',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA', 'United Wholesale Mortgage',
    'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing', 'Nevada State Bank',
    'Western Alliance Bank', 'Bank of Nevada', 'US Bank NA', 'Zions Bank',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Wei', 'Ying', 'Ming', 'Hui', 'Fang', 'Jian', 'Xiao', 'Li',
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
    'Thanh', 'Hien', 'Van', 'Minh', 'Lan', 'Tran', 'Nguyen', 'Le',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
    'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall',
    'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Sanchez', 'Ramirez', 'Flores',
    'Nguyen', 'Tran', 'Pham', 'Le', 'Vo', 'Vu', 'Dang', 'Bui',
    'Kim', 'Park', 'Choi', 'Chen', 'Wang', 'Zhang', 'Liu', 'Yang',
  ],
};

export class ClarkAdapter extends BaseAdapter {
  countyFips = '32003';
  countyName = 'Clark County';
  state = 'NV';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
