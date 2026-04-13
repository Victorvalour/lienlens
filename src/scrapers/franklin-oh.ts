// Seed data — Franklin County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'High St', 'Broad St', 'Main St', 'Cleveland Ave', 'Parsons Ave',
    'Livingston Ave', 'Mound St', 'Sullivant Ave', 'West Broad St', 'East Broad St',
    'Grandview Ave', 'Henderson Rd', 'Sawmill Rd', 'Dublin Granville Rd', 'Morse Rd',
    'Westerville Rd', 'Karl Rd', 'Maize Rd', 'Hamilton Rd', 'Refugee Rd',
    'Groveport Rd', 'Alum Creek Dr', 'Brice Rd', 'Gender Rd', 'Reynoldsburg New Albany Rd',
    'Johnstown Rd', 'Sunbury Rd', 'E Dublin Granville Rd', 'Africa Rd', 'Lewis Center Rd',
    'W Case Rd', 'Dierker Rd', 'Harrisburg Pike', 'Frank Rd', 'S High St',
    'S 3rd St', 'S 4th St', 'Whittier St', 'Greenlawn Ave', 'Lockbourne Rd',
  ],
  cities: [
    'Columbus', 'Columbus', 'Columbus', 'Columbus', 'Columbus',
    'Dublin', 'Westerville', 'Gahanna', 'Reynoldsburg', 'Grove City',
    'Upper Arlington', 'Hilliard', 'Worthington', 'Pickerington', 'Canal Winchester',
  ],
  state: 'OH',
  zipCodes: [
    '43001', '43002', '43004', '43016', '43017', '43021', '43026', '43035', '43054', '43055',
    '43068', '43085', '43109', '43110', '43119', '43123', '43125', '43137', '43147', '43201',
    '43202', '43203', '43204', '43205', '43206', '43207', '43209', '43210', '43211', '43212',
    '43213', '43214', '43215', '43216', '43217', '43218', '43219', '43220', '43221', '43222',
    '43223', '43224', '43227', '43228', '43229', '43230', '43231', '43232', '43234', '43235',
    '43236', '43240', '43251', '43260', '43266', '43268', '43270', '43271', '43272', '43279',
    '43287', '43291', '43295', '43299', '43001', '43002', '43004', '43016', '43017', '43021',
    '43026', '43035', '43054', '43055', '43068', '43085', '43109', '43110', '43119', '43123',
  ],
  parcelPrefix: '',
  parcelLength: 12,
  countyTaxSource: 'Franklin County Treasurer',
  countyClerkSource: 'Franklin County Clerk of Courts',
  countyRecorderSource: 'Franklin County Recorder',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA', 'United Wholesale Mortgage',
    'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing', 'Huntington National Bank',
    'Fifth Third Bank', 'KeyBank NA', 'First Federal Savings', 'Heartland BancCorp',
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

export class FranklinAdapter extends BaseAdapter {
  countyFips = '39049';
  countyName = 'Franklin County';
  state = 'OH';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
