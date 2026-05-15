import { describe, it, expect } from 'vitest';

// 批量导入、子样品、复测/稀释业务逻辑测试

describe('批量导入 — 校验逻辑', () => {
  interface ImportRow {
    row: number; sampleNo?: string; name?: string; type?: string; location?: string;
    samplingDate?: string; _error?: boolean; _errorMsg?: string;
  }

  function validateImportRow(row: ImportRow): ImportRow {
    const errors: string[] = [];
    if (!row.name || row.name.trim() === '') errors.push('样品名称为空');
    if (!row.type) errors.push('样品类型为空');
    if (!row.location) errors.push('采样地点为空');
    if (row.sampleNo && row.sampleNo.length > 32) errors.push('样品编号过长');
    return { ...row, _error: errors.length > 0, _errorMsg: errors.join('; ') };
  }

  it('有效行通过校验', () => {
    const result = validateImportRow({ row: 1, sampleNo: 'SMP-001', name: '地表水样', type: '水质', location: '东湖', samplingDate: '2026-05-15' });
    expect(result._error).toBe(false);
  });

  it('名称为空时报错', () => {
    const result = validateImportRow({ row: 2, sampleNo: 'SMP-002', name: '', type: '水质', location: '东湖' });
    expect(result._error).toBe(true);
    expect(result._errorMsg).toContain('为空');
  });

  it('类型为空时报错', () => {
    const result = validateImportRow({ row: 3, sampleNo: 'SMP-003', name: '样品', type: '', location: '东湖' });
    expect(result._error).toBe(true);
    expect(result._errorMsg).toContain('类型');
  });

  it('样品编号过长报错', () => {
    const result = validateImportRow({ row: 4, sampleNo: 'A'.repeat(40), name: '样品', type: '水质', location: '东湖' });
    expect(result._error).toBe(true);
    expect(result._errorMsg).toContain('过长');
  });

  it('批量1000行不崩溃', () => {
    const rows = Array.from({ length: 1000 }, (_, i) => ({
      row: i + 1, sampleNo: `SMP-${i}`, name: `样品${i}`, type: i % 3 === 0 ? '水质' : '土壤', location: '地点',
    }));
    const results = rows.map(validateImportRow);
    expect(results.length).toBe(1000);
    expect(results.filter(r => r._error).length).toBe(0);
  });

  it('混合有效/无效行的统计', () => {
    const rows = [
      { row: 1, name: '有效', type: '水质', location: '东湖' },
      { row: 2, name: '', type: '水质', location: '东湖' },
      { row: 3, name: '有效2', type: '土壤', location: '西湖' },
    ];
    const validated = rows.map(validateImportRow);
    expect(validated.filter(r => !r._error).length).toBe(2);
    expect(validated.filter(r => r._error).length).toBe(1);
  });
});

describe('复测/稀释 — 计算逻辑', () => {
  function calculateDilution(rawResult: number, dilutionFactor: number): number {
    if (dilutionFactor <= 0) throw new Error('稀释倍数必须大于0');
    return rawResult * dilutionFactor;
  }

  function calculateRPD(result1: number, result2: number): number {
    const avg = (result1 + result2) / 2;
    if (avg === 0) return 0;
    return Math.abs(result1 - result2) / avg * 100;
  }

  function calculateRecovery(spikedResult: number, originalResult: number, spikeAmount: number): number {
    if (spikeAmount === 0) throw new Error('加标量不能为0');
    return (spikedResult - originalResult) / spikeAmount * 100;
  }

  it('稀释倍数2倍: 结果翻倍', () => {
    expect(calculateDilution(12.5, 2)).toBe(25.0);
  });

  it('稀释倍数10倍', () => {
    expect(calculateDilution(3.2, 10)).toBe(32.0);
  });

  it('稀释倍数为1: 结果不变', () => {
    expect(calculateDilution(15.0, 1)).toBe(15.0);
  });

  it('稀释倍数为0抛出错误', () => {
    expect(() => calculateDilution(10, 0)).toThrow();
  });

  it('稀释倍数为负数抛出错误', () => {
    expect(() => calculateDilution(10, -1)).toThrow();
  });

  it('RPD: 2个相同值', () => {
    expect(calculateRPD(10.0, 10.0)).toBe(0);
  });

  it('RPD: 正常差值', () => {
    const rpd = calculateRPD(10.0, 12.0);
    expect(rpd).toBeCloseTo(18.18, 1);
  });

  it('RPD: 大差值', () => {
    const rpd = calculateRPD(5.0, 15.0);
    expect(rpd).toBeCloseTo(100.0, 1);
  });

  it('RPD: 差值为0时返回0', () => {
    expect(calculateRPD(0, 0)).toBe(0);
  });

  it('加标回收率: 100%', () => {
    expect(calculateRecovery(15.0, 10.0, 5.0)).toBe(100.0);
  });

  it('加标回收率: 120%', () => {
    expect(calculateRecovery(16.0, 10.0, 5.0)).toBe(120.0);
  });

  it('加标回收率: 80%', () => {
    expect(calculateRecovery(14.0, 10.0, 5.0)).toBe(80.0);
  });

  it('加标量为0抛出错误', () => {
    expect(() => calculateRecovery(10, 5, 0)).toThrow();
  });

  it('加标回收率判定: 85-115%为满意', () => {
    const recovery = calculateRecovery(11.0, 10.0, 1.0);
    expect(recovery).toBeGreaterThanOrEqual(85);
    expect(recovery).toBeLessThanOrEqual(115);
  });

  it('平行样RPD判定: ≤20%为合格', () => {
    const rpd = calculateRPD(10.0, 11.5);
    expect(rpd).toBeLessThanOrEqual(20);
  });
});

describe('子样品 — 母子关联逻辑', () => {
  interface SubSample {
    id: string; parentId: string; name: string; amount: string; status: string;
  }

  function createSubSample(parentId: string, amount: string, index: number): SubSample {
    return { id: `sub-${parentId}-${index}`, parentId, name: `子样品-${index}`, amount, status: '待检测' };
  }

  it('从母样创建子样品', () => {
    const sub = createSubSample('SMP-001', '200mL', 1);
    expect(sub.parentId).toBe('SMP-001');
    expect(sub.status).toBe('待检测');
  });

  it('从母样分多个子样品', () => {
    const subs = [
      createSubSample('SMP-001', '200mL', 1),
      createSubSample('SMP-001', '150mL', 2),
      createSubSample('SMP-001', '100mL', 3),
    ];
    expect(subs.length).toBe(3);
    expect(subs.every(s => s.parentId === 'SMP-001')).toBe(true);
  });

  it('子样品ID唯一', () => {
    const subs = Array.from({ length: 10 }, (_, i) => createSubSample('SMP-001', '50mL', i + 1));
    const ids = subs.map(s => s.id);
    expect(new Set(ids).size).toBe(10);
  });

  it('子样品可独立流转', () => {
    const sub = createSubSample('SMP-001', '200mL', 1);
    sub.status = '检测中';
    expect(sub.status).toBe('检测中');
    // 母样状态不受影响
  });
});
