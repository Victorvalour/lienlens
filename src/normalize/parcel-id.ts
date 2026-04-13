const COUNTY_PAD_LENGTHS: Record<string, number> = {
  '48201': 13, // Harris County, TX
  '17031': 14, // Cook County, IL
  '04013': 12, // Maricopa County, AZ
  '42101': 10, // Philadelphia County, PA
  '26163': 12, // Wayne County, MI
  '06037': 10, // Los Angeles County, CA
  '12086': 13, // Miami-Dade County, FL
  '48113': 12, // Dallas County, TX
  '53033': 10, // King County, WA
  '32003': 11, // Clark County, NV
  '12011': 13, // Broward County, FL
  '48439': 12, // Tarrant County, TX
  '48029': 12, // Bexar County, TX
  '36059': 12, // Nassau County, NY
  '37119': 12, // Mecklenburg County, NC
  '39049': 12, // Franklin County, OH
  '27053': 13, // Hennepin County, MN
  '06073': 10, // San Diego County, CA
  '06065': 10, // Riverside County, CA
  '36103': 12, // Suffolk County, NY
};

export function canonicalizeParcelId(raw: string, countyFips: string): string {
  let cleaned = raw.replace(/[-.\s]/g, '').toUpperCase();
  const padLength = COUNTY_PAD_LENGTHS[countyFips];
  if (padLength && cleaned.length < padLength) {
    cleaned = cleaned.padStart(padLength, '0');
  }
  return cleaned;
}
