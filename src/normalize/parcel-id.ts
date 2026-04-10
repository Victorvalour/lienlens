const COUNTY_PAD_LENGTHS: Record<string, number> = {
  '48201': 13, // Harris County, TX
  '17031': 14, // Cook County, IL
  '04013': 12, // Maricopa County, AZ
};

export function canonicalizeParcelId(raw: string, countyFips: string): string {
  let cleaned = raw.replace(/[-.\s]/g, '').toUpperCase();
  const padLength = COUNTY_PAD_LENGTHS[countyFips];
  if (padLength && cleaned.length < padLength) {
    cleaned = cleaned.padStart(padLength, '0');
  }
  return cleaned;
}
