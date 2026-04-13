import cron from 'node-cron';
import { HarrisAdapter } from '../scrapers/harris-tx.js';
import { CookAdapter } from '../scrapers/cook-il.js';
import { MaricopaAdapter } from '../scrapers/maricopa-az.js';
import { normalizeAddress } from '../normalize/address.js';
import { canonicalizeParcelId } from '../normalize/parcel-id.js';
import { mapToSignalType } from '../normalize/distress-taxonomy.js';
import {
  upsertProperty,
  upsertSignal,
  updateCountyIngestion,
  logIngestionStart,
  logIngestionEnd,
} from '../db/queries.js';
import type { BaseAdapter } from '../scrapers/base-adapter.js';

async function runAdapter(adapter: BaseAdapter): Promise<void> {
  const logId = await logIngestionStart(adapter.countyFips, adapter.constructor.name);
  let recordsFound = 0;
  let recordsNew = 0;
  let recordsFailed = 0;

  try {
    const records = await adapter.scrape();
    recordsFound = records.length;

    for (const record of records) {
      try {
        const parcelId = canonicalizeParcelId(record.rawParcelId, adapter.countyFips);
        const { normalized: addressNormalized } = normalizeAddress(record.rawAddress);
        const signalType = mapToSignalType(record.signalType);

        const propertyId = await upsertProperty({
          parcelId,
          rawParcelId: record.rawParcelId,
          countyFips: adapter.countyFips,
          addressNormalized,
          addressRaw: record.rawAddress,
          ownerName: record.ownerName,
          propertyType: record.propertyType ?? 'residential',
        });

        await upsertSignal(propertyId, {
          signalType,
          amount: record.amount,
          dateFiled: record.dateFiled,
          caseNumber: record.caseNumber,
          rawLabel: record.signalType,
          source: record.source,
          lenderName: record.lenderName,
          attorneyName: record.attorneyName,
          auctionDate: record.auctionDate,
          yearsDelinquent: record.yearsDelinquent,
        });

        recordsNew++;
      } catch (err) {
        console.error(`[Ingest] Failed record for ${adapter.countyName}:`, err);
        recordsFailed++;
      }
    }

    await updateCountyIngestion(adapter.countyFips);
    await logIngestionEnd(logId, {
      recordsFound,
      recordsNew,
      recordsUpdated: 0,
      recordsFailed,
      status: 'success',
    });

    console.log(`[Ingest] ${adapter.countyName}: ${recordsNew} records ingested, ${recordsFailed} failed`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Ingest] ${adapter.countyName} failed:`, message);
    await logIngestionEnd(logId, {
      recordsFound,
      recordsNew,
      recordsFailed,
      status: 'error',
      errorMessage: message,
    });
  }
}

export function startIngestionJobs(): void {
  // Run initial ingestion immediately on startup
  (async () => {
    console.log('[Ingest] Running initial ingestion...');
    const adapters: BaseAdapter[] = [
      new HarrisAdapter(),
      new CookAdapter(),
      new MaricopaAdapter(),
    ];
    for (const adapter of adapters) {
      await runAdapter(adapter);
    }
    console.log('[Ingest] Initial ingestion complete.');
  })().catch(err => console.error('[Ingest] Initial ingestion error:', err));

  cron.schedule('0 2 * * *', async () => {
    console.log('[Ingest] Starting daily ingestion...');
    const adapters: BaseAdapter[] = [
      new HarrisAdapter(),
      new CookAdapter(),
      new MaricopaAdapter(),
    ];
    for (const adapter of adapters) {
      await runAdapter(adapter);
    }
    console.log('[Ingest] Daily ingestion complete.');
  });
  console.log('[Ingest] Cron jobs scheduled (daily at 2am)');
}
