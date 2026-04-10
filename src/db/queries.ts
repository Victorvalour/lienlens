import { query } from './connection.js';
import type { County, Property, DistressSignal } from '../types/index.js';

// ---------------------------------------------------------------------------
// Row-mapping helpers
// ---------------------------------------------------------------------------

function rowToCounty(row: Record<string, unknown>): County {
  return {
    fips: row['fips'] as string,
    name: row['name'] as string,
    state: row['state'] as string,
    adapterName: row['adapter_name'] as string | undefined,
    hasTaxData: row['has_tax_data'] as boolean,
    hasPreforeclosureData: row['has_preforeclosure_data'] as boolean,
    hasCodeViolationData: row['has_code_violation_data'] as boolean,
    updateFrequency: row['update_frequency'] as string,
    lastIngestedAt: row['last_ingested_at'] as string | undefined,
    recordCount: Number(row['record_count']),
    status: row['status'] as string,
  };
}

// ---------------------------------------------------------------------------
// Filter interfaces
// ---------------------------------------------------------------------------

export interface SignalFilters {
  signalType?: string;
  minAmount?: number;
  maxAmount?: number;
  filedAfter?: string;
  filedBefore?: string;
  page?: number;
  pageSize?: number;
}

export interface TaxFilters {
  minAmount?: number;
  maxAmount?: number;
  minYearsDelinquent?: number;
  propertyType?: string;
  taxSaleScheduled?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PreforeclosureFilters {
  filingType?: string;
  lenderName?: string;
  filedAfter?: string;
  filedBefore?: string;
  page?: number;
  pageSize?: number;
}

export interface PropertyFilters {
  propertyType?: string;
  minDistressScore?: number;
  signalTypes?: string[];
  limit?: number;
}

export interface DistressSignalRow {
  parcelId: string;
  address: string;
  ownerName?: string;
  propertyType: string;
  signalType: string;
  amount?: number;
  dateFiled?: string;
  caseNumber?: string;
  source?: string;
  lenderName?: string;
  yearsDelinquent?: number;
}

export interface DelinquencyRow {
  parcelId: string;
  address: string;
  ownerName?: string;
  propertyType: string;
  amount: number;
  yearsDelinquent?: number;
  taxSaleScheduled: boolean;
  taxSaleDate?: string;
  dateFiled?: string;
}

export interface PreforeclosureRow {
  parcelId: string;
  address: string;
  ownerName?: string;
  propertyType: string;
  signalType: string;
  amount?: number;
  dateFiled?: string;
  caseNumber?: string;
  lenderName?: string;
  attorneyName?: string;
  auctionDate?: string;
}

export interface PropertyWithSignals {
  parcelId: string;
  address: string;
  ownerName?: string;
  propertyType: string;
  signals: DistressSignal[];
}

export interface UpsertPropertyData {
  parcelId: string;
  rawParcelId?: string;
  countyFips: string;
  addressNormalized?: string;
  addressRaw?: string;
  ownerName?: string;
  propertyType?: string;
}

export interface UpsertSignalData {
  signalType: string;
  amount?: number;
  dateFiled?: string;
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
}

export interface IngestionStats {
  recordCount?: number;
}

export interface IngestionEndStats {
  recordsFound?: number;
  recordsNew?: number;
  recordsUpdated?: number;
  recordsFailed?: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

// ---------------------------------------------------------------------------
// County queries
// ---------------------------------------------------------------------------

export async function getCounties(state?: string): Promise<County[]> {
  try {
    const sql = state
      ? 'SELECT * FROM counties WHERE state = $1 AND status = $2 ORDER BY name'
      : 'SELECT * FROM counties WHERE status = $1 ORDER BY name';
    const params = state ? [state, 'active'] : ['active'];
    const result = await query(sql, params);
    return result.rows.map(rowToCounty);
  } catch {
    return [];
  }
}

export async function getCounty(fips: string): Promise<County | null> {
  try {
    const result = await query('SELECT * FROM counties WHERE fips = $1', [fips]);
    return result.rows[0] ? rowToCounty(result.rows[0]) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Distress signal queries
// ---------------------------------------------------------------------------

export async function getDistressSignals(
  countyFips: string,
  filters: SignalFilters
): Promise<{ signals: DistressSignalRow[]; totalCount: number }> {
  try {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    const conditions: string[] = ['p.county_fips = $1'];
    const params: unknown[] = [countyFips];
    let idx = 2;

    if (filters.signalType) {
      conditions.push(`ds.signal_type = $${idx++}`);
      params.push(filters.signalType);
    }
    if (filters.minAmount !== undefined) {
      conditions.push(`ds.amount >= $${idx++}`);
      params.push(filters.minAmount);
    }
    if (filters.maxAmount !== undefined) {
      conditions.push(`ds.amount <= $${idx++}`);
      params.push(filters.maxAmount);
    }
    if (filters.filedAfter) {
      conditions.push(`ds.date_filed >= $${idx++}`);
      params.push(filters.filedAfter);
    }
    if (filters.filedBefore) {
      conditions.push(`ds.date_filed <= $${idx++}`);
      params.push(filters.filedBefore);
    }

    const where = conditions.join(' AND ');
    const countSql = `
      SELECT COUNT(*) FROM distress_signals ds
      JOIN properties p ON p.id = ds.property_id
      WHERE ${where}
    `;
    const dataSql = `
      SELECT p.parcel_id, p.address_normalized AS address, p.owner_name,
             p.property_type, ds.signal_type, ds.amount, ds.date_filed,
             ds.case_number, ds.source, ds.lender_name, ds.years_delinquent
      FROM distress_signals ds
      JOIN properties p ON p.id = ds.property_id
      WHERE ${where}
      ORDER BY ds.date_filed DESC NULLS LAST
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const [countResult, dataResult] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, pageSize, offset]),
    ]);

    const totalCount = Number(countResult.rows[0]?.['count'] ?? 0);
    const signals: DistressSignalRow[] = dataResult.rows.map(r => ({
      parcelId: r['parcel_id'] as string,
      address: (r['address'] ?? '') as string,
      ownerName: r['owner_name'] as string | undefined,
      propertyType: r['property_type'] as string,
      signalType: r['signal_type'] as string,
      amount: r['amount'] ? Number(r['amount']) : undefined,
      dateFiled: r['date_filed'] as string | undefined,
      caseNumber: r['case_number'] as string | undefined,
      source: r['source'] as string | undefined,
      lenderName: r['lender_name'] as string | undefined,
      yearsDelinquent: r['years_delinquent'] ? Number(r['years_delinquent']) : undefined,
    }));

    return { signals, totalCount };
  } catch {
    return { signals: [], totalCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// Tax delinquency queries
// ---------------------------------------------------------------------------

export async function getTaxDelinquencies(
  countyFips: string,
  filters: TaxFilters
): Promise<{ delinquencies: DelinquencyRow[]; totalCount: number }> {
  try {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    const conditions: string[] = ["p.county_fips = $1", "ds.signal_type = 'tax_lien'"];
    const params: unknown[] = [countyFips];
    let idx = 2;

    if (filters.minAmount !== undefined) {
      conditions.push(`ds.amount >= $${idx++}`);
      params.push(filters.minAmount);
    }
    if (filters.maxAmount !== undefined) {
      conditions.push(`ds.amount <= $${idx++}`);
      params.push(filters.maxAmount);
    }
    if (filters.minYearsDelinquent !== undefined) {
      conditions.push(`ds.years_delinquent >= $${idx++}`);
      params.push(filters.minYearsDelinquent);
    }
    if (filters.propertyType && filters.propertyType !== 'all') {
      conditions.push(`p.property_type = $${idx++}`);
      params.push(filters.propertyType);
    }
    if (filters.taxSaleScheduled !== undefined) {
      conditions.push(`ds.tax_sale_scheduled = $${idx++}`);
      params.push(filters.taxSaleScheduled);
    }

    const where = conditions.join(' AND ');
    const countSql = `
      SELECT COUNT(*) FROM distress_signals ds
      JOIN properties p ON p.id = ds.property_id
      WHERE ${where}
    `;
    const dataSql = `
      SELECT p.parcel_id, p.address_normalized AS address, p.owner_name,
             p.property_type, ds.amount, ds.years_delinquent,
             ds.tax_sale_scheduled, ds.tax_sale_date, ds.date_filed
      FROM distress_signals ds
      JOIN properties p ON p.id = ds.property_id
      WHERE ${where}
      ORDER BY ds.amount DESC NULLS LAST
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const [countResult, dataResult] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, pageSize, offset]),
    ]);

    const totalCount = Number(countResult.rows[0]?.['count'] ?? 0);
    const delinquencies: DelinquencyRow[] = dataResult.rows.map(r => ({
      parcelId: r['parcel_id'] as string,
      address: (r['address'] ?? '') as string,
      ownerName: r['owner_name'] as string | undefined,
      propertyType: r['property_type'] as string,
      amount: Number(r['amount'] ?? 0),
      yearsDelinquent: r['years_delinquent'] ? Number(r['years_delinquent']) : undefined,
      taxSaleScheduled: Boolean(r['tax_sale_scheduled']),
      taxSaleDate: r['tax_sale_date'] as string | undefined,
      dateFiled: r['date_filed'] as string | undefined,
    }));

    return { delinquencies, totalCount };
  } catch {
    return { delinquencies: [], totalCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// Preforeclosure queries
// ---------------------------------------------------------------------------

export async function getPreforeclosures(
  countyFips: string,
  filters: PreforeclosureFilters
): Promise<{ filings: PreforeclosureRow[]; totalCount: number }> {
  try {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    const preforeclosureTypes = ['lis_pendens', 'notice_of_default', 'notice_of_trustee_sale'];
    const filingType = filters.filingType && filters.filingType !== 'all' ? filters.filingType : null;

    const conditions: string[] = ['p.county_fips = $1'];
    const params: unknown[] = [countyFips];
    let idx = 2;

    if (filingType) {
      conditions.push(`ds.signal_type = $${idx++}`);
      params.push(filingType);
    } else {
      conditions.push(`ds.signal_type = ANY($${idx++})`);
      params.push(preforeclosureTypes);
    }

    if (filters.lenderName) {
      conditions.push(`ds.lender_name ILIKE $${idx++}`);
      params.push(`%${filters.lenderName}%`);
    }
    if (filters.filedAfter) {
      conditions.push(`ds.date_filed >= $${idx++}`);
      params.push(filters.filedAfter);
    }
    if (filters.filedBefore) {
      conditions.push(`ds.date_filed <= $${idx++}`);
      params.push(filters.filedBefore);
    }

    const where = conditions.join(' AND ');
    const countSql = `
      SELECT COUNT(*) FROM distress_signals ds
      JOIN properties p ON p.id = ds.property_id
      WHERE ${where}
    `;
    const dataSql = `
      SELECT p.parcel_id, p.address_normalized AS address, p.owner_name,
             p.property_type, ds.signal_type, ds.amount, ds.date_filed,
             ds.case_number, ds.lender_name, ds.attorney_name, ds.auction_date
      FROM distress_signals ds
      JOIN properties p ON p.id = ds.property_id
      WHERE ${where}
      ORDER BY ds.date_filed DESC NULLS LAST
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const [countResult, dataResult] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, pageSize, offset]),
    ]);

    const totalCount = Number(countResult.rows[0]?.['count'] ?? 0);
    const filings: PreforeclosureRow[] = dataResult.rows.map(r => ({
      parcelId: r['parcel_id'] as string,
      address: (r['address'] ?? '') as string,
      ownerName: r['owner_name'] as string | undefined,
      propertyType: r['property_type'] as string,
      signalType: r['signal_type'] as string,
      amount: r['amount'] ? Number(r['amount']) : undefined,
      dateFiled: r['date_filed'] as string | undefined,
      caseNumber: r['case_number'] as string | undefined,
      lenderName: r['lender_name'] as string | undefined,
      attorneyName: r['attorney_name'] as string | undefined,
      auctionDate: r['auction_date'] as string | undefined,
    }));

    return { filings, totalCount };
  } catch {
    return { filings: [], totalCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// Properties with signals
// ---------------------------------------------------------------------------

export async function getPropertiesWithSignals(
  countyFips: string,
  filters: PropertyFilters
): Promise<PropertyWithSignals[]> {
  try {
    const limit = filters.limit ?? 100;
    const conditions: string[] = ['p.county_fips = $1'];
    const params: unknown[] = [countyFips];
    let idx = 2;

    if (filters.propertyType && filters.propertyType !== 'all') {
      conditions.push(`p.property_type = $${idx++}`);
      params.push(filters.propertyType);
    }
    if (filters.signalTypes && filters.signalTypes.length > 0) {
      conditions.push(`ds.signal_type = ANY($${idx++})`);
      params.push(filters.signalTypes);
    }

    const where = conditions.join(' AND ');
    const sql = `
      SELECT p.parcel_id, p.address_normalized AS address, p.owner_name, p.property_type,
             json_agg(json_build_object(
               'signalType', ds.signal_type,
               'amount', ds.amount,
               'dateFiled', ds.date_filed,
               'caseNumber', ds.case_number,
               'source', ds.source,
               'yearsDelinquent', ds.years_delinquent,
               'lenderName', ds.lender_name,
               'taxSaleScheduled', ds.tax_sale_scheduled,
               'taxSaleDate', ds.tax_sale_date
             )) AS signals
      FROM properties p
      JOIN distress_signals ds ON ds.property_id = p.id
      WHERE ${where}
      GROUP BY p.id, p.parcel_id, p.address_normalized, p.owner_name, p.property_type
      ORDER BY p.parcel_id
      LIMIT $${idx}
    `;

    const result = await query(sql, [...params, limit]);
    return result.rows.map(r => ({
      parcelId: r['parcel_id'] as string,
      address: (r['address'] ?? '') as string,
      ownerName: r['owner_name'] as string | undefined,
      propertyType: r['property_type'] as string,
      signals: (r['signals'] as DistressSignal[]) ?? [],
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Upsert helpers
// ---------------------------------------------------------------------------

export async function upsertProperty(data: UpsertPropertyData): Promise<number> {
  const sql = `
    INSERT INTO properties (parcel_id, raw_parcel_id, county_fips, address_normalized, address_raw, owner_name, property_type, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    ON CONFLICT (parcel_id, county_fips) DO UPDATE
      SET raw_parcel_id = EXCLUDED.raw_parcel_id,
          address_normalized = COALESCE(EXCLUDED.address_normalized, properties.address_normalized),
          address_raw = COALESCE(EXCLUDED.address_raw, properties.address_raw),
          owner_name = COALESCE(EXCLUDED.owner_name, properties.owner_name),
          property_type = EXCLUDED.property_type,
          updated_at = NOW()
    RETURNING id
  `;
  const result = await query<{ id: number }>(sql, [
    data.parcelId,
    data.rawParcelId ?? null,
    data.countyFips,
    data.addressNormalized ?? null,
    data.addressRaw ?? null,
    data.ownerName ?? null,
    data.propertyType ?? 'residential',
  ]);
  return result.rows[0]!.id;
}

export async function upsertSignal(propertyId: number, data: UpsertSignalData): Promise<void> {
  const sql = `
    INSERT INTO distress_signals (
      property_id, signal_type, amount, date_filed, case_number,
      raw_label, source, lender_name, attorney_name, auction_date,
      years_delinquent, last_payment_date, tax_sale_scheduled, tax_sale_date, metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    ON CONFLICT (property_id, signal_type, COALESCE(case_number, ''), COALESCE(date_filed::TEXT, ''))
    DO UPDATE SET
      amount = EXCLUDED.amount,
      raw_label = EXCLUDED.raw_label,
      source = EXCLUDED.source,
      lender_name = EXCLUDED.lender_name,
      attorney_name = EXCLUDED.attorney_name,
      auction_date = EXCLUDED.auction_date,
      years_delinquent = EXCLUDED.years_delinquent,
      last_payment_date = EXCLUDED.last_payment_date,
      tax_sale_scheduled = EXCLUDED.tax_sale_scheduled,
      tax_sale_date = EXCLUDED.tax_sale_date,
      metadata = EXCLUDED.metadata,
      ingested_at = NOW()
  `;
  await query(sql, [
    propertyId,
    data.signalType,
    data.amount ?? null,
    data.dateFiled ?? null,
    data.caseNumber ?? null,
    data.rawLabel ?? null,
    data.source ?? null,
    data.lenderName ?? null,
    data.attorneyName ?? null,
    data.auctionDate ?? null,
    data.yearsDelinquent ?? null,
    data.lastPaymentDate ?? null,
    data.taxSaleScheduled ?? false,
    data.taxSaleDate ?? null,
    data.metadata ? JSON.stringify(data.metadata) : null,
  ]);
}

export async function updateCountyIngestion(fips: string, stats: IngestionStats): Promise<void> {
  try {
    await query(
      `UPDATE counties SET last_ingested_at = NOW(), record_count = $1, updated_at = NOW() WHERE fips = $2`,
      [stats.recordCount ?? 0, fips]
    );
  } catch {
    // ignore
  }
}

export async function logIngestionStart(fips: string, adapterName: string): Promise<number> {
  try {
    const result = await query<{ id: number }>(
      `INSERT INTO ingestion_logs (county_fips, adapter_name, status) VALUES ($1, $2, 'running') RETURNING id`,
      [fips, adapterName]
    );
    return result.rows[0]!.id;
  } catch {
    return -1;
  }
}

export async function logIngestionEnd(logId: number, stats: IngestionEndStats): Promise<void> {
  try {
    if (logId < 0) return;
    await query(
      `UPDATE ingestion_logs
       SET finished_at = NOW(), records_found = $1, records_new = $2,
           records_updated = $3, records_failed = $4, status = $5, error_message = $6
       WHERE id = $7`,
      [
        stats.recordsFound ?? 0,
        stats.recordsNew ?? 0,
        stats.recordsUpdated ?? 0,
        stats.recordsFailed ?? 0,
        stats.status,
        stats.errorMessage ?? null,
        logId,
      ]
    );
  } catch {
    // ignore
  }
}

// Re-export types used downstream
export type { County, Property, DistressSignal };
