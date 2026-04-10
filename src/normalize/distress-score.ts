import type { DistressSignal } from '../types/index.js';

const SIGNAL_SEVERITY: Record<string, number> = {
  notice_of_trustee_sale: 40,
  notice_of_default: 30,
  lis_pendens: 25,
  tax_lien: 20,
  code_violation: 10,
};

export function calculateDistressScore(signals: DistressSignal[]): number {
  if (signals.length === 0) return 0;

  let score = 0;

  // Number of signals (up to 15 points)
  score += Math.min(signals.length * 3, 15);

  // Severity score (up to 40 points)
  const maxSeverity = Math.max(...signals.map(s => SIGNAL_SEVERITY[s.signalType] ?? 0));
  score += maxSeverity;

  // Amount score (up to 25 points)
  const totalAmount = signals.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  if (totalAmount > 0) {
    const amountScore = Math.min(Math.log10(totalAmount) * 5, 25);
    score += amountScore;
  }

  // Recency score (up to 10 points)
  const now = Date.now();
  const mostRecent = signals
    .filter(s => s.dateFiled)
    .map(s => new Date(s.dateFiled!).getTime())
    .sort((a, b) => b - a)[0];
  if (mostRecent) {
    const daysSince = (now - mostRecent) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - daysSince / 30);
    score += recencyScore;
  }

  // Duration score (up to 10 points)
  const maxYearsDelinquent = Math.max(...signals.map(s => s.yearsDelinquent ?? 0));
  score += Math.min(maxYearsDelinquent * 2, 10);

  return Math.min(Math.round(score), 100);
}
