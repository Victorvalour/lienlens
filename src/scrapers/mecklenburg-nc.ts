// Seed data — Mecklenburg County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Independence Blvd', 'Central Ave', 'Monroe Rd', 'Albemarle Rd', 'Sharon Amity Rd',
    'Providence Rd', 'Fairview Rd', 'Sardis Rd', 'Rea Rd', 'Park Rd',
    'Carmel Rd', 'Pineville Matthews Rd', 'South Blvd', 'Arrowood Rd', 'Woodlawn Rd',
    'Sharon Rd', 'Randolph Rd', 'Freedom Dr', 'Beatties Ford Rd', 'Brookshire Fwy',
    'W Trade St', 'E Trade St', 'Tryon St', 'College St', 'Church St',
    'Mint St', 'Stonewall St', 'South End Dr', 'Camden Rd', 'Wilkinson Blvd',
    'Rozzelles Ferry Rd', 'Statesville Ave', 'Brookshire Dr', 'Old Concord Rd', 'Harris Blvd',
    'University City Blvd', 'W WT Harris Blvd', 'Reames Rd', 'Mallard Creek Rd', 'Rocky River Rd',
  ],
  cities: [
    'Charlotte', 'Charlotte', 'Charlotte', 'Charlotte', 'Charlotte',
    'Huntersville', 'Matthews', 'Mint Hill', 'Cornelius', 'Pineville',
    'Davidson', 'Ballantyne', 'Steele Creek', 'University City', 'NoDa',
  ],
  state: 'NC',
  zipCodes: [
    '28201', '28202', '28203', '28204', '28205', '28206', '28207', '28208', '28209', '28210',
    '28211', '28212', '28213', '28214', '28215', '28216', '28217', '28218', '28219', '28220',
    '28221', '28222', '28223', '28224', '28225', '28226', '28227', '28228', '28229', '28230',
    '28231', '28232', '28233', '28234', '28235', '28236', '28237', '28241', '28242', '28243',
    '28244', '28246', '28247', '28250', '28253', '28254', '28255', '28256', '28258', '28260',
    '28262', '28263', '28265', '28266', '28269', '28270', '28271', '28272', '28273', '28274',
    '28275', '28277', '28278', '28280', '28281', '28282', '28283', '28284', '28285', '28287',
    '28288', '28289', '28290', '28296', '28297', '28299', '28201', '28202', '28203', '28204',
  ],
  parcelPrefix: '',
  parcelLength: 12,
  countyTaxSource: 'Mecklenburg County Tax Collector',
  countyClerkSource: 'Mecklenburg County Clerk of Superior Court',
  countyRecorderSource: 'Mecklenburg County Register of Deeds',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA', 'United Wholesale Mortgage',
    'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing', 'Truist Bank',
    'First Horizon Bank', 'South State Bank', 'Live Oak Bank', 'Cardinal Bankshares',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Darnell', 'Keisha', 'DeAndre', 'Latoya', 'Marcus', 'Tiffany', 'Jamal', 'Shaniqua',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
    'Wei', 'Ying', 'Ming', 'Hui', 'Fang', 'Jian', 'Xiao', 'Li',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
    'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall',
    'Washington', 'Jefferson', 'Freeman', 'Coleman', 'Reed', 'Bryant', 'Carter', 'Ford',
    'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Sanchez', 'Ramirez', 'Flores',
    'Kim', 'Park', 'Choi', 'Chen', 'Wang', 'Zhang', 'Liu', 'Yang',
  ],
};

export class MecklenburgAdapter extends BaseAdapter {
  countyFips = '37119';
  countyName = 'Mecklenburg County';
  state = 'NC';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
