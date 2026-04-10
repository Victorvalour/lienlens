export interface County {
  fips: string;
  name: string;
  state: string;
  adapterName?: string;
  hasTaxData: boolean;
  hasPreforeclosureData: boolean;
  hasCodeViolationData: boolean;
  updateFrequency: string;
  lastIngestedAt?: string;
  recordCount: number;
  status: string;
}

export interface Property {
  id?: number;
  parcelId: string;
  rawParcelId?: string;
  countyFips: string;
  addressNormalized?: string;
  addressRaw?: string;
  ownerName?: string;
  propertyType: string;
  latitude?: number;
  longitude?: number;
}

export type SignalType =
  | 'tax_lien'
  | 'lis_pendens'
  | 'notice_of_default'
  | 'notice_of_trustee_sale'
  | 'code_violation';

export interface DistressSignal {
  id?: number;
  propertyId?: number;
  signalType: SignalType;
  amount?: number;
  dateFiled?: string;
  dateEffective?: string;
  caseNumber?: string;
  rawLabel?: string;
  source?: string;
  lenderName?: string;
  attorneyName?: string;
  auctionDate?: string;
  yearsDelinquent?: number;
  lastPaymentDate?: string;
  taxSaleScheduled?: boolean;
  taxSaleDate?: string;
  metadata?: Record<string, unknown>;
  ingestedAt?: string;
}

export type DataFreshness = 'real_time' | 'daily' | 'weekly' | 'monthly' | 'stale';
export type ActionabilityRating = 'hot' | 'warm' | 'cold';
export type TrendDirection = 'increasing' | 'stable' | 'decreasing';
export type PropertyType = 'residential' | 'commercial' | 'land' | 'all';
export type SortBy = 'distress_score' | 'amount_owed' | 'date_filed';
export type FilingType = 'lis_pendens' | 'notice_of_default' | 'notice_of_trustee_sale' | 'all';

export interface DistressedProperty {
  parcelId: string;
  address: string;
  ownerName?: string;
  propertyType: string;
  distressScore: number;
  signals: Array<{
    type: SignalType;
    amount?: number;
    date?: string;
    source?: string;
  }>;
  estimatedEquityPosition?: number;
  actionabilityRating: ActionabilityRating;
  daysSinceFirstSignal: number;
}
