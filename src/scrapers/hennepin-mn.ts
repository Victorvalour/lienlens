// Seed data — Hennepin County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Hennepin Ave', 'Nicollet Mall', 'Lyndale Ave', 'Fremont Ave', 'Penn Ave',
    'France Ave', 'Xerxes Ave', 'York Ave', 'Upton Ave', 'Thomas Ave',
    'Broadway Ave', 'Plymouth Ave', 'Glenwood Ave', 'Olson Memorial Hwy', 'Golden Valley Rd',
    'Wayzata Blvd', 'Excelsior Blvd', '494', 'Cedar Ave', 'Portland Ave',
    'Park Ave', 'Bloomington Ave', 'East Lake St', 'West Lake St', 'Minnehaha Ave',
    'Hiawatha Ave', 'Marshall Ave', 'Lake St', '28th St', '38th St',
    '46th St', 'Crosstown Hwy', 'Penn Ave S', 'Xerxes Ave S', 'France Ave S',
    'Valley View Rd', 'W 78th St', 'Carlson Pkwy', 'Bass Lake Rd', 'Boone Ave',
  ],
  cities: [
    'Minneapolis', 'Minneapolis', 'Minneapolis', 'Minneapolis', 'Minneapolis',
    'Bloomington', 'Brooklyn Park', 'Plymouth', 'Maple Grove', 'Eden Prairie',
    'St Louis Park', 'Minnetonka', 'Golden Valley', 'Richfield', 'Edina',
  ],
  state: 'MN',
  zipCodes: [
    '55401', '55402', '55403', '55404', '55405', '55406', '55407', '55408', '55409', '55410',
    '55411', '55412', '55413', '55414', '55415', '55416', '55417', '55418', '55419', '55420',
    '55421', '55422', '55423', '55424', '55425', '55426', '55427', '55428', '55429', '55430',
    '55431', '55432', '55433', '55434', '55435', '55436', '55437', '55438', '55439', '55440',
    '55441', '55442', '55443', '55444', '55445', '55446', '55447', '55448', '55449', '55450',
    '55454', '55455', '55458', '55459', '55460', '55467', '55468', '55470', '55472', '55473',
    '55474', '55478', '55479', '55480', '55483', '55484', '55485', '55486', '55487', '55488',
    '55401', '55402', '55403', '55404', '55405', '55406', '55407', '55408', '55409', '55410',
  ],
  parcelPrefix: '',
  parcelLength: 13,
  countyTaxSource: 'Hennepin County Treasurer - Property Tax Division',
  countyClerkSource: 'Hennepin County District Court Administrator',
  countyRecorderSource: 'Hennepin County Recorder',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA', 'United Wholesale Mortgage',
    'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing', 'Associated Bank NA',
    'Bremer Bank NA', 'Alerus Financial NA', 'Bell Bank', 'Viking Bank',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
    'Darnell', 'Keisha', 'DeAndre', 'Latoya', 'Marcus', 'Tiffany', 'Jamal', 'Shaniqua',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Hmong', 'Pang', 'Xiong', 'Vue', 'Yang', 'Vang', 'Thao', 'Moua',
    'Ahmed', 'Fatima', 'Hassan', 'Aisha', 'Mohammed', 'Zainab', 'Omar', 'Nadia',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
    'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall',
    'Xiong', 'Vue', 'Yang', 'Vang', 'Thao', 'Moua', 'Her', 'Lor',
    'Washington', 'Jefferson', 'Freeman', 'Coleman', 'Reed', 'Bryant', 'Carter', 'Ford',
    'Olson', 'Larson', 'Nelson', 'Peterson', 'Anderson', 'Johnson', 'Hanson', 'Gustafson',
  ],
};

export class HennepinAdapter extends BaseAdapter {
  countyFips = '27053';
  countyName = 'Hennepin County';
  state = 'MN';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
