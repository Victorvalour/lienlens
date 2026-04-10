export interface ScrapedRecord {
  rawParcelId: string;
  rawAddress: string;
  ownerName?: string;
  propertyType?: string;
  signalType: string;
  amount?: number;
  dateFiled?: string;
  caseNumber?: string;
  lenderName?: string;
  attorneyName?: string;
  auctionDate?: string;
  yearsDelinquent?: number;
  source: string;
}

export abstract class BaseAdapter {
  abstract countyFips: string;
  abstract countyName: string;
  abstract state: string;
  abstract scrape(): Promise<ScrapedRecord[]>;
}
