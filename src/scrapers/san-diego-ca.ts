// Seed data — San Diego County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Broadway', 'Market St', 'India St', 'Harbor Dr', 'Pacific Hwy',
    'Midway Dr', 'Rosecrans St', 'Sunset Cliffs Blvd', 'Voltaire St', 'Bacon St',
    'Mission Blvd', 'Garnet Ave', 'Balboa Ave', 'Clairemont Mesa Blvd', 'Genesee Ave',
    'Mira Mesa Blvd', 'Pomerado Rd', 'Scripps Ranch Blvd', 'Carmel Mountain Rd', 'Rancho Bernardo Rd',
    'El Cajon Blvd', 'University Ave', 'Adams Ave', 'Monroe Ave', 'Park Blvd',
    'Fairmount Ave', 'College Ave', 'Alvarado Rd', 'Waring Rd', 'Navajo Rd',
    'Fletcher Hills Pkwy', 'Broadway', 'Main St', 'Magnolia Ave', ' Greenfield Dr',
    'Escondido Blvd', 'Valley Pkwy', 'Mission Ave', 'Grand Ave', 'Coast Hwy 101',
  ],
  cities: [
    'San Diego', 'San Diego', 'San Diego', 'San Diego', 'San Diego',
    'Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad', 'El Cajon',
    'Vista', 'San Marcos', 'Encinitas', 'Santee', 'Poway',
  ],
  state: 'CA',
  zipCodes: [
    '92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110',
    '92111', '92113', '92114', '92115', '92116', '92117', '92118', '92119', '92120', '92121',
    '92122', '92123', '92124', '92126', '92127', '92128', '92129', '92130', '92131', '92132',
    '92133', '92134', '92135', '92136', '92137', '92138', '92139', '92140', '92142', '92145',
    '92147', '92149', '92150', '92152', '92153', '92154', '92155', '92158', '92159', '92160',
    '92161', '92162', '92163', '92164', '92165', '92166', '92167', '92168', '92169', '92170',
    '92171', '92172', '92173', '92174', '92175', '92176', '92177', '92178', '92179', '92182',
    '92184', '92186', '92187', '92190', '92191', '92192', '92193', '92194', '92195', '92196',
  ],
  parcelPrefix: '',
  parcelLength: 10,
  countyTaxSource: 'San Diego County Treasurer-Tax Collector',
  countyClerkSource: 'San Diego County Superior Court Clerk',
  countyRecorderSource: 'San Diego County Assessor/Recorder/County Clerk',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'Caliber Home Loans', 'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA',
    'United Wholesale Mortgage', 'NewRez LLC', 'Carrington Mortgage', 'CalFirst Bank',
    'Axos Bank', 'Pacific Premier Bank', 'Silvergate Bank', 'Bankers Hill Bank',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Wei', 'Ying', 'Ming', 'Hui', 'Fang', 'Jian', 'Xiao', 'Li',
    'Thanh', 'Hien', 'Van', 'Minh', 'Lan', 'Tran', 'Nguyen', 'Le',
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
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

export class SanDiegoAdapter extends BaseAdapter {
  countyFips = '06073';
  countyName = 'San Diego County';
  state = 'CA';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
