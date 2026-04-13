// Seed data — Miami-Dade County does not currently offer a public bulk data API. Replace with real scraping when data access is obtained.
import { BaseAdapter } from './base-adapter.js';
import type { ScrapedRecord } from './base-adapter.js';
import { generateSeedRecords } from './seed-generator.js';
import type { SeedConfig } from './seed-generator.js';

const CONFIG: SeedConfig = {
  streets: [
    'Biscayne Blvd', 'SW 8th St', 'NW 7th Ave', 'US-1', 'Flagler St',
    'Coral Way', 'Bird Rd', 'Kendall Dr', 'Miller Dr', 'Sunset Dr',
    'SW 137th Ave', 'NW 27th Ave', 'NW 79th St', 'NE 2nd Ave', 'Collins Ave',
    'Washington Ave', 'Ocean Dr', 'Alton Rd', 'Arthur Godfrey Rd', 'NW 36th St',
    'LeJeune Rd', 'Miracle Mile', 'Alhambra Plaza', 'Salzedo St', 'Giralda Ave',
    'Krome Ave', 'SW 312th St', 'Campbell Dr', 'Homestead Blvd', 'NW 186th St',
    'NW 119th St', 'NW 135th St', 'NW 57th Ave', 'NW 87th Ave', 'NW 107th Ave',
    'SW 72nd St', 'SW 88th St', 'SW 107th Ave', 'SW 137th Ave', 'Florida Turnpike',
  ],
  cities: [
    'Miami', 'Miami', 'Miami', 'Miami', 'Miami',
    'Hialeah', 'Miami Beach', 'Homestead', 'Miami Gardens', 'North Miami',
    'Doral', 'Coral Gables', 'Kendall', 'Aventura', 'Cutler Bay',
  ],
  state: 'FL',
  zipCodes: [
    '33010', '33012', '33013', '33014', '33015', '33016', '33018', '33030', '33031', '33032',
    '33033', '33034', '33035', '33039', '33054', '33055', '33056', '33101', '33109', '33122',
    '33125', '33126', '33127', '33128', '33129', '33130', '33131', '33132', '33133', '33134',
    '33135', '33136', '33137', '33138', '33139', '33140', '33141', '33142', '33143', '33144',
    '33145', '33146', '33147', '33150', '33155', '33156', '33157', '33158', '33160', '33161',
    '33162', '33165', '33166', '33167', '33168', '33169', '33170', '33172', '33173', '33174',
    '33175', '33176', '33177', '33178', '33179', '33180', '33181', '33182', '33183', '33184',
    '33185', '33186', '33187', '33189', '33190', '33193', '33194', '33196', '33197', '33199',
  ],
  parcelPrefix: '',
  parcelLength: 13,
  countyTaxSource: 'Miami-Dade County Tax Collector',
  countyClerkSource: 'Miami-Dade County Clerk of Courts',
  countyRecorderSource: 'Miami-Dade County Recorder',
  lenders: [
    'Wells Fargo Bank NA', 'JPMorgan Chase Bank NA', 'Bank of America NA',
    'Nationstar Mortgage', 'Rocket Mortgage', 'Freedom Mortgage', 'PennyMac Loan Services',
    'LoanDepot', 'US Bank Home Mortgage', 'Citibank NA', 'United Wholesale Mortgage',
    'NewRez LLC', 'Carrington Mortgage', 'Ocwen Loan Servicing', 'Florida Community Bank',
    'Seacoast Bank', 'BankUnited', 'TotalBank', 'Amerant Bank', 'Professional Bank',
  ],
  ownerFirstNames: [
    'James', 'Robert', 'Maria', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara',
    'Jose', 'Maria', 'Juan', 'Carmen', 'Carlos', 'Rosa', 'Miguel', 'Elena',
    'Jorge', 'Ana', 'Luis', 'Isabel', 'Pedro', 'Sofia', 'Alejandro', 'Valentina',
    'Haitienne', 'Jean', 'Pierre', 'Marie', 'Paul', 'Claudette', 'Reginald', 'Nadine',
    'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Karen', 'Thomas', 'Nancy',
  ],
  ownerLastNames: [
    'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Garcia', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Sanchez',
    'Rodriguez', 'Ramirez', 'Flores', 'Rivera', 'Reyes', 'Cruz', 'Gutierrez', 'Diaz',
    'Morales', 'Ortiz', 'Dominguez', 'Castillo', 'Vargas', 'Mendez', 'Fernandez', 'Ramos',
    'Pierre', 'Baptiste', 'Joseph', 'Jean', 'Louis', 'Michel', 'Charles', 'Nicolas',
    'Patel', 'Shah', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Mehta', 'Desai',
  ],
};

export class MiamiDadeAdapter extends BaseAdapter {
  countyFips = '12086';
  countyName = 'Miami-Dade County';
  state = 'FL';

  async scrape(): Promise<ScrapedRecord[]> {
    return generateSeedRecords(CONFIG, 220);
  }
}
