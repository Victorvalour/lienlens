// Seed data — Riverside County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Magnolia Ave', 'Arlington Ave', 'Van Buren Blvd', 'Central Ave', 'Mission Inn Ave',
    'University Ave', 'Market St', 'Main St', 'Riverside Ave', 'Chicago Ave',
    'Indiana Ave', 'Jurupa Ave', 'Limonite Ave', 'Hamner Ave', 'Etiwanda Ave',
    'Day St', 'Perris Blvd', 'Nance St', 'Mapes Rd', 'Case Rd',
    'Winchester Rd', 'Murrieta Hot Springs Rd', 'Clinton Keith Rd', 'Newport Rd', 'Scott Rd',
    'Washington Ave', 'Jefferson Ave', 'Adams St', 'Jackson St', 'Monroe St',
    'Date Palm Dr', 'Varner Rd', 'Avenue 54', 'Monroe St', 'Golf Center Dr',
    'Florida Ave', 'Esplanade Ave', 'Girard St', 'Lyon Ave', 'Sanderson Ave',
  ],
  cities: [
    'Riverside', 'Moreno Valley', 'Corona', 'Temecula', 'Murrieta',
    'Jurupa Valley', 'Menifee', 'Indio', 'Hemet', 'Perris',
    'Lake Elsinore', 'Eastvale', 'Wildomar', 'Canyon Lake', 'Banning',
  ],
  state: 'CA',
  zipCodes: [
    '92501', '92502', '92503', '92504', '92505', '92506', '92507', '92508', '92509', '92518',
    '92519', '92521', '92522', '92530', '92532', '92543', '92544', '92545', '92546', '92548',
    '92549', '92551', '92552', '92553', '92554', '92555', '92556', '92557', '92562', '92563',
    '92564', '92567', '92570', '92571', '92572', '92581', '92582', '92583', '92584', '92585',
    '92586', '92587', '92589', '92590', '92591', '92592', '92593', '92595', '92596', '92599',
    '92201', '92202', '92203', '92210', '92211', '92220', '92223', '92225', '92226', '92230',
    '92231', '92232', '92233', '92234', '92235', '92236', '92239', '92240', '92241', '92242',
    '92243', '92244', '92247', '92248', '92249', '92250', '92251', '92252', '92253', '92254',
  ],
  parcelPrefix: '',
  parcelLength: 10,
  countyTaxSource: 'Riverside County Treasurer-Tax Collector',
  countyClerkSource: 'Riverside County Superior Court Clerk',
  countyRecorderSource: 'Riverside County Assessor-County Clerk-Recorder',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'Caliber Home Loans', 'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA',
    'United Wholesale Mortgage', 'NewRez LLC', 'Carrington Mortgage', 'Guild Mortgage',
    'Pacific Premier Bank', 'Axos Bank', 'CommerceWest Bank', 'Inland Western Bank',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Jorge', 'Ana', 'Luis', 'Isabel', 'Pedro', 'Sofia', 'Alejandro', 'Valentina',
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
    'Thanh', 'Hien', 'Van', 'Minh', 'Lan', 'Tran', 'Nguyen', 'Le',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
    'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall',
    'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Sanchez', 'Ramirez', 'Flores',
    'Morales', 'Gutierrez', 'Ortiz', 'Dominguez', 'Castillo', 'Vargas', 'Mendez', 'Cruz',
    'Nguyen', 'Tran', 'Pham', 'Le', 'Vo', 'Vu', 'Dang', 'Bui',
  ],
};

export class RiversideAdapter extends BaseAdapter {
  countyFips = '06065';
  countyName = 'Riverside County';
  state = 'CA';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
