// Seed data — Tarrant County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Camp Bowie Blvd', 'University Dr', 'Berry St', 'Hulen St', 'I-30',
    'Oak Grove Rd', 'Sycamore School Rd', 'McCart Ave', 'Altamesa Blvd', 'Crowley Rd',
    'South Fwy', 'Henderson St', 'Magnolia Ave', 'Hemphill St', 'S Main St',
    'E Lancaster Ave', 'W Vickery Blvd', 'Jennings Ave', 'White Settlement Rd', 'Jacksboro Hwy',
    'NE Loop 820', 'Belknap St', 'Beach St', 'Rufe Snow Dr', 'Davis Blvd',
    'Grapevine Hwy', 'Bedford Rd', 'Industrial Blvd', 'Harwood Rd', 'Trinity Blvd',
    'Pioneer Pkwy', 'Division St', 'Park Row Dr', 'Handley Ederville Rd', 'Randol Mill Rd',
    'Precinct Line Rd', 'Pipeline Rd', 'Colleyville Blvd', 'Euless Main St', 'Mid-Cities Blvd',
  ],
  cities: [
    'Fort Worth', 'Fort Worth', 'Fort Worth', 'Fort Worth', 'Arlington',
    'Arlington', 'Mansfield', 'North Richland Hills', 'Euless', 'Bedford',
    'Grapevine', 'Keller', 'Hurst', 'Colleyville', 'Southlake',
  ],
  state: 'TX',
  zipCodes: [
    '76001', '76002', '76006', '76010', '76011', '76012', '76013', '76014', '76015', '76016',
    '76017', '76018', '76019', '76021', '76022', '76034', '76039', '76040', '76051', '76052',
    '76053', '76054', '76060', '76063', '76092', '76099', '76101', '76102', '76103', '76104',
    '76105', '76106', '76107', '76108', '76109', '76110', '76111', '76112', '76114', '76115',
    '76116', '76117', '76118', '76119', '76120', '76123', '76126', '76129', '76131', '76132',
    '76133', '76134', '76135', '76137', '76140', '76148', '76155', '76177', '76179', '76180',
    '76182', '76185', '76190', '76191', '76192', '76193', '76195', '76196', '76197', '76198',
    '76199', '76001', '76004', '76007', '76094', '76095', '76096', '76097', '76098', '76005',
  ],
  parcelPrefix: '',
  parcelLength: 12,
  countyTaxSource: 'Tarrant County Tax Assessor-Collector',
  countyClerkSource: 'Tarrant County District Clerk',
  countyRecorderSource: 'Tarrant County Clerk - Recording Division',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'Caliber Home Loans', 'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA',
    'United Wholesale Mortgage', 'NewRez LLC', 'Carrington Mortgage', 'Mr Cooper',
    'Texas Capital Bank', 'Prosperity Bank', 'Veritex Community Bank', 'Southwest Securities',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Darnell', 'Keisha', 'DeAndre', 'Latoya', 'Marcus', 'Tiffany', 'Jamal', 'Shaniqua',
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
    'Thanh', 'Hien', 'Van', 'Minh', 'Lan', 'Tran', 'Nguyen', 'Le',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
    'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall',
    'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Sanchez', 'Ramirez', 'Flores',
    'Nguyen', 'Tran', 'Pham', 'Le', 'Vo', 'Vu', 'Dang', 'Bui',
    'Patel', 'Shah', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Mehta',
  ],
};

export class TarrantAdapter extends BaseAdapter {
  countyFips = '48439';
  countyName = 'Tarrant County';
  state = 'TX';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
