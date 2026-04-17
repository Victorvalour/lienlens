const COUNTY_PAD_LENGTHS: Record<string, number> = {
  '17031': 14, // Cook County, IL
  '42101': 10, // Philadelphia County, PA
  '36061': 10, // New York City, NY (BBL)
  '39049': 12, // Franklin County, OH
};

export function canonicalizeParcelId(raw: string, countyFips: string): string {
  let cleaned = raw.replace(/[-.\s]/g, '').toUpperCase();
  const padLength = COUNTY_PAD_LENGTHS[countyFips];
  if (padLength && cleaned.length < padLength) {
    cleaned = cleaned.padStart(padLength, '0');
  }
  return cleaned;
}
