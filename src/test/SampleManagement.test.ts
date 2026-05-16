import { describe, it, expect } from 'vitest';

describe('Sample Aliquot Management', () => {
  const validateAliquot = (parentVol: number, aliquots: { volume: number }[]) => {
    const total = aliquots.reduce((s, a) => s + a.volume, 0);
    return { valid: total <= parentVol, total, remaining: parentVol - total };
  };

  it('passes when aliquots total < parent volume', () => {
    const r = validateAliquot(1000, [{ volume: 200 }, { volume: 300 }, { volume: 400 }]);
    expect(r.valid).toBe(true);
    expect(r.remaining).toBe(100);
  });

  it('fails when aliquots total > parent volume', () => {
    const r = validateAliquot(500, [{ volume: 200 }, { volume: 300 }, { volume: 200 }]);
    expect(r.valid).toBe(false);
    expect(r.remaining).toBe(-200);
  });

  it('passes when exactly equal', () => {
    expect(validateAliquot(700, [{ volume: 200 }, { volume: 500 }]).valid).toBe(true);
  });

  it('generates aliquot numbers correctly', () => {
    const generateAliquotNo = (parentNo: string, index: number) => 
      `${parentNo}-${String.fromCharCode(65 + index)}`;
    expect(generateAliquotNo('SMP-001', 0)).toBe('SMP-001-A');
    expect(generateAliquotNo('SMP-001', 1)).toBe('SMP-001-B');
    expect(generateAliquotNo('SMP-001', 2)).toBe('SMP-001-C');
  });
});

describe('Sample Retention Management', () => {
  const getRetentionStatus = (expiryDate: string) => {
    const daysLeft = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return { status: 'expired', daysLeft };
    if (daysLeft <= 7) return { status: 'expiring', daysLeft };
    return { status: 'active', daysLeft };
  };

  it('marks far future dates as active', () => {
    const future = new Date(); future.setDate(future.getDate() + 100);
    expect(getRetentionStatus(future.toISOString().slice(0, 10)).status).toBe('active');
  });

  it('marks dates within 7 days as expiring', () => {
    const soon = new Date(); soon.setDate(soon.getDate() + 3);
    expect(getRetentionStatus(soon.toISOString().slice(0, 10)).status).toBe('expiring');
  });

  it('marks past dates as expired', () => {
    const past = new Date(); past.setDate(past.getDate() - 10);
    expect(getRetentionStatus(past.toISOString().slice(0, 10)).status).toBe('expired');
  });

  it('validates disposal methods', () => {
    const validMethods = ['destroy', 'return', 'extend'];
    expect(validMethods).toContain('destroy');
    expect(validMethods).toContain('extend');
    expect(validMethods).not.toContain('delete');
  });
});

describe('Sample Reception Validation', () => {
  const validateReception = (temp: number, requiredMin: number, requiredMax: number) => {
    if (temp < requiredMin || temp > requiredMax) {
      return { valid: false, level: 'abnormal', reason: `温度${temp}℃超出范围${requiredMin}-${requiredMax}℃` };
    }
    return { valid: true, level: 'normal', reason: null };
  };

  it('rejects temperature out of range', () => {
    const r = validateReception(12, 2, 8);
    expect(r.valid).toBe(false);
    expect(r.level).toBe('abnormal');
  });

  it('accepts temperature in range', () => {
    const r = validateReception(4, 2, 8);
    expect(r.valid).toBe(true);
    expect(r.level).toBe('normal');
  });

  it('detects conditional receive boundary', () => {
    const canConditional = (temp: number, max: number) => temp <= max + 5;
    expect(canConditional(12, 8)).toBe(true);
    expect(canConditional(20, 8)).toBe(false);
  });
});

describe('Storage Location', () => {
  const parseLocation = (loc: string) => {
    const parts = loc.split('·').map(s => s.trim());
    return { room: parts[0] || '', fridge: parts[1] || '', shelf: parts[2] || '', box: parts[3] || '' };
  };

  it('parses structured location correctly', () => {
    const loc = parseLocation('样品室A · 冰箱#3 · 2层 · B盒');
    expect(loc.room).toBe('样品室A');
    expect(loc.fridge).toBe('冰箱#3');
    expect(loc.shelf).toBe('2层');
    expect(loc.box).toBe('B盒');
  });

  it('handles partial location', () => {
    const loc = parseLocation('样品室A · 冰箱#3');
    expect(loc.room).toBe('样品室A');
    expect(loc.fridge).toBe('冰箱#3');
    expect(loc.shelf).toBe('');
  });
});

describe('Sample Batch Import Validation', () => {
  const validateImport = (rows: any[]) => {
    const errors: { row: number; msg: string }[] = [];
    rows.forEach((r, i) => {
      if (!r.name) errors.push({ row: i + 1, msg: '样品名称不能为空' });
      if (!r.type) errors.push({ row: i + 1, msg: '样品类型不能为空' });
    });
    return { valid: errors.length === 0, errors, total: rows.length };
  };

  it('passes valid rows', () => {
    expect(validateImport([{ name: '样品1', type: '地表水' }]).valid).toBe(true);
  });

  it('fails rows with missing name', () => {
    const r = validateImport([{ name: '', type: '地表水' }]);
    expect(r.valid).toBe(false);
    expect(r.errors[0].msg).toContain('样品名称');
  });

  it('fails rows with missing type', () => {
    const r = validateImport([{ name: '样品1', type: '' }]);
    expect(r.valid).toBe(false);
  });
});
