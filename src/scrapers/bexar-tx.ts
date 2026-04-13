// Seed data — Bexar County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Broadway', 'Commerce St', 'Navarro St', 'St Mary\'s St', 'San Pedro Ave',
    'Fredericksburg Rd', 'Bandera Rd', 'Culebra Rd', 'Marbach Rd', 'Potranco Rd',
    'Military Dr', 'Pleasanton Rd', 'Roosevelt Ave', 'SE Military Dr', 'S WW White Rd',
    'Rigsby Ave', 'Eisenhauer Rd', 'Perrin Beitel Rd', 'Nacogdoches Rd', 'Loop 1604',
    'Wurzbach Rd', 'Vance Jackson Rd', 'UTSA Blvd', 'Grissom Rd', 'Babcock Rd',
    'Huebner Rd', 'DeZavala Rd', 'Callaghan Rd', 'Ingram Rd', 'Prue Rd',
    'W Commerce St', 'Zarzamora St', 'Cupples Rd', 'S Flores St', 'Division Ave',
    'SW 36th St', 'Old Corpus Christi Rd', 'Mission Rd', 'Goliad Rd', 'SE Loop 410',
  ],
  cities: [
    'San Antonio', 'San Antonio', 'San Antonio', 'San Antonio', 'San Antonio',
    'San Antonio', 'Converse', 'Live Oak', 'Universal City', 'Windcrest',
    'Helotes', 'Leon Valley', 'Balcones Heights', 'Alamo Heights', 'Castle Hills',
  ],
  state: 'TX',
  zipCodes: [
    '78201', '78202', '78203', '78204', '78205', '78206', '78207', '78208', '78209', '78210',
    '78211', '78212', '78213', '78214', '78215', '78216', '78217', '78218', '78219', '78220',
    '78221', '78222', '78223', '78224', '78225', '78226', '78227', '78228', '78229', '78230',
    '78231', '78232', '78233', '78234', '78235', '78236', '78237', '78238', '78239', '78240',
    '78241', '78242', '78243', '78244', '78245', '78246', '78247', '78248', '78249', '78250',
    '78251', '78252', '78253', '78254', '78255', '78256', '78257', '78258', '78259', '78260',
    '78261', '78263', '78264', '78265', '78266', '78268', '78269', '78270', '78275', '78278',
    '78279', '78280', '78283', '78284', '78285', '78286', '78287', '78288', '78289', '78291',
  ],
  parcelPrefix: '',
  parcelLength: 12,
  countyTaxSource: 'Bexar County Tax Assessor-Collector',
  countyClerkSource: 'Bexar County District Clerk',
  countyRecorderSource: 'Bexar County Clerk - Real Property Records',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'Caliber Home Loans', 'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA',
    'United Wholesale Mortgage', 'NewRez LLC', 'Carrington Mortgage', 'Mr Cooper',
    'Texas Capital Bank', 'Frost Bank', 'Cullen/Frost Bankers', 'Broadway Bank',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Jorge', 'Ana', 'Luis', 'Isabel', 'Pedro', 'Sofia', 'Alejandro', 'Valentina',
    'Darnell', 'Keisha', 'DeAndre', 'Latoya', 'Marcus', 'Tiffany', 'Jamal', 'Shaniqua',
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
    'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall',
    'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Sanchez', 'Ramirez', 'Flores',
    'Morales', 'Gutierrez', 'Ortiz', 'Dominguez', 'Castillo', 'Vargas', 'Mendez', 'Cruz',
    'Patel', 'Shah', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Mehta',
  ],
};

export class BexarAdapter extends BaseAdapter {
  countyFips = '48029';
  countyName = 'Bexar County';
  state = 'TX';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
