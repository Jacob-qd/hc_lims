// Unified ID/Number generation utilities
// Format: PREFIX-YYYYMMDD-NNN

export function generateId(prefix: string, seq: number): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${date}-${String(seq).padStart(3, '0')}`;
}

export function generateOrderNo(seq: number): string { return generateId('ORD', seq); }
export function generateSampleNo(seq: number): string { return generateId('SMP', seq); }
export function generateTaskNo(seq: number): string { return generateId('TK', seq); }
export function generateReportNo(seq: number): string { return generateId('RPT', seq); }
export function generateCOCNo(seq: number): string { return generateId('COC', seq); }
export function generateQCPlanNo(seq: number): string { return generateId('QC', seq); }
export function generateELNNo(seq: number): string { return generateId('ELN', seq); }
export function generateCertificateNo(seq: number): string { return generateId('CERT', seq); }

// Unified datetime format: YYYY-MM-DD HH:mm
export function now(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
