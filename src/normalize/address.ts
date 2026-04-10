export function normalizeAddress(raw: string): { normalized: string; unit?: string } {
  const abbreviations: Record<string, string> = {
    '\\bST\\b': 'STREET',
    '\\bAVE\\b': 'AVENUE',
    '\\bBLVD\\b': 'BOULEVARD',
    '\\bDR\\b': 'DRIVE',
    '\\bLN\\b': 'LANE',
    '\\bCT\\b': 'COURT',
    '\\bRD\\b': 'ROAD',
    '\\bPL\\b': 'PLACE',
    '\\bCIR\\b': 'CIRCLE',
  };

  let upper = raw.toUpperCase().trim();

  // Extract unit info
  let unit: string | undefined;
  const unitMatch = upper.match(/\b(APT|UNIT|SUITE|STE|#)\s*([A-Z0-9-]+)/);
  if (unitMatch) {
    unit = unitMatch[0];
    upper = upper.replace(unitMatch[0], '').trim();
  }

  // Expand abbreviations
  for (const [pattern, replacement] of Object.entries(abbreviations)) {
    upper = upper.replace(new RegExp(pattern, 'g'), replacement);
  }

  // Remove punctuation except hyphens
  upper = upper.replace(/[^A-Z0-9\s-]/g, '');

  // Collapse multiple spaces
  upper = upper.replace(/\s+/g, ' ').trim();

  return unit ? { normalized: upper, unit } : { normalized: upper };
}
