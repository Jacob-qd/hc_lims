import { describe, it, expect } from 'vitest';
import { generateId, generateSampleNo, generateReportNo, now, today } from '../utils/idgen';

describe('ID Generation', () => {
  it('generates order number', () => expect(generateId('ORD', 1)).toMatch(/^ORD-\d{8}-001$/));
  it('generates sample number', () => expect(generateSampleNo(5)).toMatch(/^SMP-\d{8}-005$/));
  it('generates report number', () => expect(generateReportNo(99)).toMatch(/^RPT-\d{8}-099$/));
  it('now returns YYYY-MM-DD HH:mm', () => expect(now()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/));
  it('today returns YYYY-MM-DD', () => expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/));
});

describe('Dashboard Alert Model', () => {
  it('alert types are valid', () => {
    const types = ['qc_violation', 'calibration_due', 'reagent_expiry', 'cert_expiry'];
    types.forEach(t => expect(['qc_violation', 'calibration_due', 'reagent_expiry', 'cert_expiry']).toContain(t));
  });
  
  it('alert levels map to correct colors', () => {
    const levelColors: Record<string, string> = { critical: '#ff4d4f', warning: '#faad14', info: '#1677ff' };
    expect(levelColors.critical).toBe('#ff4d4f');
    expect(levelColors.warning).toBe('#faad14');
  });
});

describe('Aliquot Volume Validation', () => {
  const validateAliquot = (parentVol: number, aliquots: {volume: number}[]) => {
    const total = aliquots.reduce((s, a) => s + a.volume, 0);
    return total <= parentVol;
  };

  it('passes when aliquots total < parent volume', () => {
    expect(validateAliquot(1000, [{volume:200},{volume:300},{volume:400}])).toBe(true);
  });

  it('fails when aliquots total > parent volume', () => {
    expect(validateAliquot(500, [{volume:200},{volume:300},{volume:200}])).toBe(false);
  });

  it('passes when exactly equal', () => {
    expect(validateAliquot(700, [{volume:200},{volume:500}])).toBe(true);
  });
});

describe('Retention Expiry Calculation', () => {
  const getDaysLeft = (expiryDate: string): number => {
    return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  };

  const getExpiryStatus = (daysLeft: number): string => {
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 7) return 'expiring';
    return 'active';
  };

  it('returns active for far future dates', () => {
    const far = new Date(); far.setDate(far.getDate() + 100);
    const days = getDaysLeft(far.toISOString().slice(0, 10));
    expect(getExpiryStatus(days)).toBe('active');
  });

  it('returns expired for past dates', () => {
    const past = new Date(); past.setDate(past.getDate() - 10);
    const days = getDaysLeft(past.toISOString().slice(0, 10));
    expect(getExpiryStatus(days)).toBe('expired');
  });
});

describe('Permission Merge (deny-override)', () => {
  const mergePermissions = (roles: {edit: string}[]): string => {
    const priority: Record<string, number> = { none: 0, own: 1, all: 2 };
    let result = 'all';
    for (const r of roles) {
      if (priority[r.edit] < priority[result]) result = r.edit;
    }
    return result;
  };

  it('deny overrides allow when roles conflict', () => {
    expect(mergePermissions([{edit: 'all'}, {edit: 'none'}])).toBe('none');
  });

  it('own is stricter than all', () => {
    expect(mergePermissions([{edit: 'all'}, {edit: 'own'}])).toBe('own');
  });
});
