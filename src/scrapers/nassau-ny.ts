// Seed data — Nassau County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Hempstead Tpke', 'Sunrise Hwy', 'Merrick Rd', 'Southern State Pkwy', 'Old Country Rd',
    'Peninsula Blvd', 'Rockaway Blvd', 'Atlantic Ave', 'Front St', 'Main St',
    'Stewart Ave', 'Jerusalem Ave', 'Newbridge Rd', 'Wantagh Ave', 'Carman Ave',
    'Linden Blvd', 'Jamaica Ave', 'Fulton Ave', 'Woodfield Rd', 'Bellmore Ave',
    'Bedell St', 'Prospect Ave', 'Nassau Blvd', 'E Meadow Ave', 'Uniondale Ave',
    'Charles Blvd', 'Nassau Rd', 'Meadowbrook Pkwy', 'Ocean Ave', 'Central Ave',
    'Franklin Ave', 'Mitchel Field Rd', 'Post Ave', 'Jericho Tpke', 'Northern Blvd',
    'Glen Cove Rd', 'Oyster Bay Rd', 'Willis Ave', 'Mineola Ave', 'County Seat Dr',
  ],
  cities: [
    'Hempstead', 'Garden City', 'Freeport', 'Valley Stream', 'Massapequa',
    'Hicksville', 'Levittown', 'Long Beach', 'Uniondale', 'East Meadow',
    'Bellmore', 'Wantagh', 'Seaford', 'Elmont', 'New Hyde Park',
  ],
  state: 'NY',
  zipCodes: [
    '11501', '11502', '11503', '11505', '11507', '11509', '11510', '11514', '11516', '11518',
    '11520', '11530', '11531', '11535', '11536', '11542', '11545', '11547', '11548', '11549',
    '11550', '11551', '11552', '11553', '11554', '11555', '11556', '11557', '11558', '11559',
    '11560', '11561', '11563', '11565', '11566', '11568', '11569', '11570', '11571', '11572',
    '11575', '11576', '11577', '11579', '11580', '11581', '11582', '11583', '11585', '11590',
    '11592', '11594', '11595', '11596', '11597', '11598', '11599', '11501', '11502', '11503',
    '11504', '11505', '11506', '11507', '11508', '11509', '11510', '11514', '11516', '11518',
    '11520', '11530', '11531', '11535', '11536', '11542', '11545', '11547', '11548', '11549',
  ],
  parcelPrefix: '',
  parcelLength: 12,
  countyTaxSource: 'Nassau County Treasurer\'s Office - Tax Division',
  countyClerkSource: 'Nassau County Supreme Court Clerk',
  countyRecorderSource: 'Nassau County Clerk - Deeds Division',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA', 'United Wholesale Mortgage',
    'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing', 'NYCB Mortgage',
    'Emigrant Bank', 'Investors Bank', 'Columbia Bank', 'Cross County Savings Bank',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Anthony', 'Jennifer', 'Frank', 'Donna', 'Vincent', 'Angela', 'Louis', 'Rosemarie',
    'Salvatore', 'Carmela', 'Gennaro', 'Filomena', 'Pasquale', 'Concetta', 'Rocco', 'Giuseppa',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Wei', 'Ying', 'Ming', 'Hui', 'Fang', 'Jian', 'Xiao', 'Li',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
    'Russo', 'Esposito', 'Ferraro', 'Caruso', 'Rizzo', 'Greco', 'Romano', 'Lombardi',
    'Conti', 'Costa', 'Mancini', 'DeFrancesco', 'Aquino', 'Amato', 'Santoro', 'Fontana',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Sanchez',
    'Kim', 'Park', 'Choi', 'Chen', 'Wang', 'Zhang', 'Liu', 'Yang',
  ],
};

export class NassauAdapter extends BaseAdapter {
  countyFips = '36059';
  countyName = 'Nassau County';
  state = 'NY';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
