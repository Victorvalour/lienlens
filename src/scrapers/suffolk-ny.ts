// Seed data — Suffolk County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Montauk Hwy', 'Sunrise Hwy', 'Jericho Tpke', 'Northern State Pkwy', 'Hempstead Tpke',
    'Merrick Rd', 'Southern State Pkwy', 'Sunrise Hwy', 'William Floyd Pkwy', 'Nicoll Blvd',
    'Main St', 'Carleton Ave', 'Straight Path', 'Deer Park Ave', 'Commack Rd',
    'Larkfield Rd', 'Pulaski Rd', 'Broadway', 'Park Ave', 'Bay Shore Rd',
    'Union Blvd', 'Brentwood Rd', 'Suffolk Ave', 'Motor Pkwy', 'Veterans Memorial Hwy',
    'Crooked Hill Rd', 'Long Island Ave', 'Albany Ave', 'Wading River Rd', 'Horseblock Rd',
    'Medford Ave', 'Patchogue Yaphank Rd', 'Co Rd 101', 'Middle Country Rd', 'Nesconset Hwy',
    'Lake Ave', 'Pond Path', 'Terry Rd', 'Portion Rd', 'Pond Rd',
  ],
  cities: [
    'Brookhaven', 'Islip', 'Babylon', 'Huntington', 'Smithtown',
    'Patchogue', 'Bay Shore', 'Brentwood', 'Central Islip', 'Commack',
    'Coram', 'Medford', 'Selden', 'Ridge', 'Shirley',
  ],
  state: 'NY',
  zipCodes: [
    '11701', '11702', '11703', '11704', '11705', '11706', '11707', '11708', '11709', '11710',
    '11713', '11715', '11716', '11717', '11718', '11719', '11720', '11721', '11722', '11724',
    '11725', '11726', '11727', '11729', '11730', '11731', '11732', '11733', '11735', '11736',
    '11737', '11738', '11739', '11740', '11741', '11742', '11743', '11745', '11746', '11747',
    '11749', '11750', '11751', '11752', '11753', '11754', '11755', '11756', '11757', '11758',
    '11760', '11762', '11763', '11764', '11765', '11766', '11767', '11768', '11769', '11770',
    '11771', '11772', '11773', '11774', '11775', '11776', '11777', '11778', '11779', '11780',
    '11782', '11783', '11784', '11786', '11787', '11788', '11789', '11790', '11791', '11792',
  ],
  parcelPrefix: '',
  parcelLength: 12,
  countyTaxSource: 'Suffolk County Treasurer\'s Office - Tax Division',
  countyClerkSource: 'Suffolk County Supreme Court Clerk',
  countyRecorderSource: 'Suffolk County Clerk - Deeds Division',
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

export class SuffolkAdapter extends BaseAdapter {
  countyFips = '36103';
  countyName = 'Suffolk County';
  state = 'NY';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
