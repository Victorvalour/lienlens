// Seed data — Los Angeles County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Wilshire Blvd', 'Sunset Blvd', 'Hollywood Blvd', 'Ventura Blvd', 'Sepulveda Blvd',
    'Vermont Ave', 'Western Ave', 'Crenshaw Blvd', 'Figueroa St', 'Broadway',
    'Colorado Blvd', 'Foothill Blvd', 'Rosecrans Ave', 'Imperial Hwy', 'Florence Ave',
    'Century Blvd', 'Manchester Ave', 'Slauson Ave', 'Jefferson Blvd', 'Washington Blvd',
    'Pico Blvd', 'Olympic Blvd', 'Santa Monica Blvd', 'Melrose Ave', 'Beverly Blvd',
    'Adams Blvd', 'MLK Jr Blvd', 'Alameda St', 'Spring St', 'Main St',
    'Long Beach Blvd', 'Atlantic Blvd', 'Pacific Coast Hwy', 'Hawthorne Blvd', 'Aviation Blvd',
    'Prairie Ave', 'Inglewood Ave', 'Van Ness Ave', 'Normandie Ave', 'Hoover St',
  ],
  cities: [
    'Los Angeles', 'Los Angeles', 'Los Angeles', 'Los Angeles', 'Los Angeles',
    'Long Beach', 'Glendale', 'Pasadena', 'Torrance', 'Compton',
    'Inglewood', 'Downey', 'Pomona', 'El Monte', 'Hawthorne',
  ],
  state: 'CA',
  zipCodes: [
    '90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90010', '90011',
    '90012', '90013', '90014', '90015', '90016', '90017', '90018', '90019', '90020', '90021',
    '90022', '90023', '90024', '90025', '90026', '90027', '90028', '90029', '90031', '90032',
    '90033', '90034', '90035', '90036', '90037', '90038', '90039', '90041', '90042', '90043',
    '90044', '90045', '90046', '90047', '90048', '90049', '90057', '90058', '90059', '90061',
    '90062', '90063', '90065', '90066', '90067', '90068', '90071', '90077', '90089', '90094',
    '90210', '90211', '90212', '90230', '90232', '90245', '90247', '90248', '90249', '90250',
    '90254', '90260', '90261', '90262', '90265', '90266', '90270', '90272', '90274', '90277',
    '90278', '90280', '90290', '90291', '90292', '90293', '90301', '90302', '90303', '90304',
    '90401', '90501', '90502', '90503', '90504', '90601', '90602', '90603', '90604', '90605',
  ],
  parcelPrefix: '',
  parcelLength: 10,
  countyTaxSource: 'Los Angeles County Treasurer and Tax Collector',
  countyClerkSource: 'Los Angeles County Superior Court',
  countyRecorderSource: 'Los Angeles County Registrar-Recorder/County Clerk',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'Caliber Home Loans', 'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA',
    'United Wholesale Mortgage', 'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing',
    'Selene Finance', 'PHH Mortgage', 'SLS Specialized Loan Servicing', 'Mr Cooper',
    'Flagstar Bank', 'Guaranteed Rate Inc', 'Movement Mortgage', 'Guild Mortgage',
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
    'Patel', 'Shah', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Mehta',
  ],
};

export class LosAngelesAdapter extends BaseAdapter {
  countyFips = '06037';
  countyName = 'Los Angeles County';
  state = 'CA';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
