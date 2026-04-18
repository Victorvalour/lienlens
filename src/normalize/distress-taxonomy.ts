export enum SignalTypeEnum {
  TAX_LIEN = 'tax_lien',
  // The following types are retained for forward-compatibility but are not actively ingested.
  LIS_PENDENS = 'lis_pendens',
  NOTICE_OF_DEFAULT = 'notice_of_default',
  NOTICE_OF_TRUSTEE_SALE = 'notice_of_trustee_sale',
  CODE_VIOLATION = 'code_violation',
}

const RAW_LABEL_MAP: Array<[RegExp, SignalTypeEnum]> = [
  [/tax\s*(lien|delinq|sale|cert)/i, SignalTypeEnum.TAX_LIEN],
  [/lis\s*pendens|lp\b/i, SignalTypeEnum.LIS_PENDENS],
  [/notice\s*of\s*default|nod\b/i, SignalTypeEnum.NOTICE_OF_DEFAULT],
  [/notice\s*of\s*trustee|nots\b|trustee\s*sale/i, SignalTypeEnum.NOTICE_OF_TRUSTEE_SALE],
  [/code\s*(violation|enforce|comply)/i, SignalTypeEnum.CODE_VIOLATION],
];

export function mapToSignalType(rawLabel: string): SignalTypeEnum {
  for (const [pattern, signalType] of RAW_LABEL_MAP) {
    if (pattern.test(rawLabel)) {
      return signalType;
    }
  }
  return SignalTypeEnum.TAX_LIEN; // default fallback
}
