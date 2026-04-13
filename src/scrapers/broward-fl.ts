// Seed data — Broward County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'US-1', 'Broward Blvd', 'Oakland Park Blvd', 'Commercial Blvd', 'Sunrise Blvd',
    'Atlantic Blvd', 'Hallandale Beach Blvd', 'Stirling Rd', 'Pines Blvd', 'Johnson St',
    'Sheridan St', 'Hollywood Blvd', 'Pembroke Rd', 'Griffin Rd', 'Miramar Pkwy',
    'Flamingo Rd', 'University Dr', 'Hiatus Rd', 'Nob Hill Rd', 'Pine Island Rd',
    'State Rd 7', 'Powerline Rd', 'Dixie Hwy', 'Andrews Ave', 'Federal Hwy',
    'Las Olas Blvd', 'SE 17th St', 'Davie Blvd', 'Peters Rd', 'Davie Rd',
    'SW 136th Ave', 'SW 148th Ave', 'Wiles Rd', 'Lyons Rd', 'Coral Ridge Dr',
    'NE 26th St', 'NW 9th Ave', 'S Andrews Ave', 'E Sunrise Blvd', 'Deerfield Beach Blvd',
  ],
  cities: [
    'Fort Lauderdale', 'Fort Lauderdale', 'Hollywood', 'Pembroke Pines', 'Miramar',
    'Coral Springs', 'Davie', 'Plantation', 'Sunrise', 'Deerfield Beach',
    'Pompano Beach', 'Tamarac', 'Margate', 'Coconut Creek', 'Hallandale Beach',
  ],
  state: 'FL',
  zipCodes: [
    '33301', '33304', '33305', '33306', '33308', '33309', '33310', '33311', '33312', '33313',
    '33314', '33315', '33316', '33317', '33319', '33320', '33321', '33322', '33323', '33324',
    '33325', '33326', '33327', '33328', '33329', '33330', '33331', '33332', '33334', '33388',
    '33401', '33406', '33407', '33408', '33409', '33410', '33411', '33412', '33413', '33414',
    '33415', '33416', '33417', '33418', '33419', '33420', '33421', '33422', '33423', '33424',
    '33425', '33426', '33427', '33428', '33430', '33431', '33432', '33433', '33434', '33435',
    '33436', '33437', '33438', '33439', '33440', '33441', '33442', '33443', '33444', '33445',
    '33446', '33448', '33449', '33454', '33460', '33461', '33462', '33463', '33464', '33465',
  ],
  parcelPrefix: '',
  parcelLength: 13,
  countyTaxSource: 'Broward County Records, Taxes and Treasury Division',
  countyClerkSource: 'Broward County Clerk of Courts',
  countyRecorderSource: 'Broward County Records Division',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA', 'United Wholesale Mortgage',
    'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing', 'BankUnited',
    'Seacoast Bank', 'Amerant Bank', 'Professional Bank', 'South State Bank', 'Pinnacle Bank',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Haitienne', 'Jean', 'Pierre', 'Marie', 'Paul', 'Claudette', 'Reginald', 'Nadine',
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
    'Jorge', 'Ana', 'Luis', 'Isabel', 'Pedro', 'Sofia', 'Alejandro', 'Valentina',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
    'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall',
    'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Sanchez', 'Ramirez', 'Flores',
    'Pierre', 'Baptiste', 'Joseph', 'Jean', 'Louis', 'Michel', 'Charles', 'Nicolas',
    'Patel', 'Shah', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Mehta', 'Desai',
  ],
};

export class BrowardAdapter extends BaseAdapter {
  countyFips = '12011';
  countyName = 'Broward County';
  state = 'FL';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
