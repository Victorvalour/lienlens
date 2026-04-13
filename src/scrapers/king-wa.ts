// Seed data — King County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Pike St', 'Pine St', 'Broadway', 'Capitol Hill Ave', 'Rainier Ave S',
    'MLK Jr Way S', 'Beacon Ave S', 'California Ave SW', 'Delridge Way SW', 'Roxbury St',
    '35th Ave SW', 'Lake City Way NE', 'Aurora Ave N', '15th Ave NE', '23rd Ave',
    'Madison St', 'Cherry St', 'Jackson St', 'Yesler Way', 'S Jackson St',
    '1st Ave', '2nd Ave', '3rd Ave', '4th Ave', '5th Ave',
    'Boren Ave', 'Eastlake Ave E', 'Westlake Ave N', 'Stone Way N', 'Phinney Ave N',
    'Meridian Ave N', 'Greenwood Ave N', 'Holman Rd NW', 'NW Market St', 'NW 85th St',
    '15th Ave NW', 'Leary Way NW', '8th Ave NW', 'Fremont Ave N', '36th Ave NE',
  ],
  cities: [
    'Seattle', 'Seattle', 'Seattle', 'Seattle', 'Seattle',
    'Bellevue', 'Kent', 'Renton', 'Federal Way', 'Auburn',
    'Kirkland', 'Redmond', 'Burien', 'Tukwila', 'SeaTac',
  ],
  state: 'WA',
  zipCodes: [
    '98001', '98002', '98003', '98004', '98005', '98006', '98007', '98008', '98010', '98011',
    '98012', '98014', '98019', '98022', '98023', '98024', '98027', '98028', '98029', '98030',
    '98031', '98032', '98033', '98034', '98038', '98039', '98040', '98042', '98045', '98047',
    '98050', '98051', '98053', '98055', '98056', '98057', '98058', '98059', '98065', '98068',
    '98072', '98074', '98075', '98077', '98092', '98101', '98102', '98103', '98104', '98105',
    '98106', '98107', '98108', '98109', '98110', '98112', '98115', '98116', '98117', '98118',
    '98119', '98121', '98122', '98125', '98126', '98133', '98134', '98136', '98144', '98146',
    '98148', '98155', '98158', '98164', '98166', '98168', '98177', '98178', '98188', '98199',
  ],
  parcelPrefix: '',
  parcelLength: 10,
  countyTaxSource: 'King County Treasury Operations',
  countyClerkSource: 'King County Superior Court Clerk',
  countyRecorderSource: 'King County Recorder\'s Office',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA', 'United Wholesale Mortgage',
    'NewRez LLC', 'Carrington Mortgage', 'HomeStreet Bank', 'Banner Bank',
    'Washington Federal', 'Pacific Premier Bank', 'Columbia Bank', 'Riverview Community Bank',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Wei', 'Ying', 'Ming', 'Hui', 'Fang', 'Jian', 'Xiao', 'Li',
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Lakshmi', 'Ramesh', 'Kavita',
    'Thanh', 'Hien', 'Van', 'Minh', 'Lan', 'Tran', 'Nguyen', 'Le',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
    'Kim', 'Park', 'Choi', 'Chen', 'Wang', 'Zhang', 'Liu', 'Yang',
    'Nguyen', 'Tran', 'Pham', 'Le', 'Vo', 'Vu', 'Dang', 'Bui',
    'Patel', 'Shah', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Mehta',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Sanchez',
  ],
};

export class KingAdapter extends BaseAdapter {
  countyFips = '53033';
  countyName = 'King County';
  state = 'WA';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
