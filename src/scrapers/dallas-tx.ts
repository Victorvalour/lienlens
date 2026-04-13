// Seed data — Dallas County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Main St', 'Commerce St', 'Elm St', 'Ross Ave', 'McKinney Ave',
    'Harry Hines Blvd', 'Oak Lawn Ave', 'Cedar Springs Rd', 'Lemmon Ave', 'Greenville Ave',
    'Mockingbird Ln', 'University Blvd', 'Lovers Ln', 'Forest Ln', 'Skillman St',
    'Garland Rd', 'Buckner Blvd', 'Scyene Rd', 'Military Pkwy', 'Belt Line Rd',
    'Pioneer Dr', 'Singleton Blvd', 'Westmoreland Rd', 'Cockrell Hill Rd', 'Duncanville Rd',
    'Camp Wisdom Rd', 'Kiest Blvd', 'Ledbetter Dr', 'Illinois Ave', 'Colorado Blvd',
    'Hampton Rd', 'Bishop Ave', 'Jefferson Blvd', 'Clarendon Dr', 'Lancaster Rd',
    'Marsalis Ave', 'Beckley Ave', 'Zang Blvd', 'Davis St', 'Seventh St',
  ],
  cities: [
    'Dallas', 'Dallas', 'Dallas', 'Dallas', 'Dallas',
    'Irving', 'Garland', 'Mesquite', 'Grand Prairie', 'Richardson',
    'Carrollton', 'DeSoto', 'Cedar Hill', 'Duncanville', 'Lancaster',
  ],
  state: 'TX',
  zipCodes: [
    '75001', '75006', '75007', '75011', '75019', '75038', '75039', '75040', '75041', '75042',
    '75043', '75044', '75050', '75051', '75052', '75061', '75062', '75063', '75080', '75081',
    '75082', '75115', '75116', '75134', '75137', '75138', '75149', '75150', '75159', '75172',
    '75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75210',
    '75211', '75212', '75214', '75215', '75216', '75217', '75218', '75219', '75220', '75223',
    '75224', '75225', '75226', '75227', '75228', '75229', '75230', '75231', '75232', '75233',
    '75234', '75235', '75236', '75237', '75238', '75240', '75241', '75243', '75244', '75246',
    '75247', '75249', '75251', '75252', '75253', '75287', '75390', '75391', '75392', '75393',
  ],
  parcelPrefix: '',
  parcelLength: 12,
  countyTaxSource: 'Dallas County Tax Assessor-Collector',
  countyClerkSource: 'Dallas County District Clerk',
  countyRecorderSource: 'Dallas County Clerk - Records Division',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'Caliber Home Loans', 'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA',
    'United Wholesale Mortgage', 'NewRez LLC', 'Carrington Mortgage', 'Mr Cooper',
    'Texas Capital Bank', 'Prosperity Bank', 'Veritex Community Bank', 'Hilltop National Bank',
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

export class DallasAdapter extends BaseAdapter {
  countyFips = '48113';
  countyName = 'Dallas County';
  state = 'TX';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
