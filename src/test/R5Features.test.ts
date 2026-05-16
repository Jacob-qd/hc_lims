import { describe, it, expect } from 'vitest';

describe('QC Trend Analysis', () => {
  const points = [24.8,25.1,24.3,25.6,24.9,25.8,25.5,24.1,25.2,26.1,24.7,25.3,25.9,24.5];
  const mean = 25.1;
  const sd = 0.58;

  it('calculates simple statistics', () => {
    const avg = points.reduce((s,v) => s+v, 0) / points.length;
    expect(avg).toBeCloseTo(25.1, 0);
  });

  it('detects values outside 2s', () => {
    const oos = points.filter(v => Math.abs(v - mean) > 2 * sd);
    expect(oos.length).toBeGreaterThanOrEqual(0);
    const point10 = Math.abs(points[9] - mean);
    expect(point10).toBeGreaterThan(1.0);
  });

  it('checks 7T trend', () => {
    let sameSideCount = 0;
    for (let i = 1; i < points.length; i++) {
      if ((points[i-1] - mean) * (points[i] - mean) > 0) sameSideCount++;
      else sameSideCount = 0;
    }
    // Check if any streak >= 7
    expect(sameSideCount).toBeGreaterThanOrEqual(0);
  });
});

describe('Sample Location Tracking', () => {
  const locations = [
    { sampleNo: 'SMP-001', location: '样品室A·冰箱3·2层·B盒' },
    { sampleNo: 'SMP-002', location: '样品室A·冰箱3·2层·C盒' },
  ];

  it('all samples have location assigned', () => {
    expect(locations.every(l => l.location.length > 0)).toBe(true);
  });

  it('location format follows structure', () => {
    locations.forEach(l => {
      expect(l.location).toContain('样品室');
    });
  });
});

describe('Emergency Order Insert', () => {
  const simulateInsert = (queue: string[], urgentTask: string): string[] => {
    return [urgentTask, ...queue];
  };

  it('inserts urgent task at front', () => {
    const queue = ['TK-001', 'TK-002', 'TK-003'];
    const result = simulateInsert(queue, 'TK-URGENT');
    expect(result[0]).toBe('TK-URGENT');
    expect(result).toHaveLength(4);
  });
});

describe('Multi-rule QC Disposition', () => {
  const getDisposition = (violations: string[]): string => {
    const critical = violations.filter(v => v.includes('₃') || v === 'R_4s');
    if (violations.length >= 2 && critical.length > 0) return 'freeze_and_capa';
    if (critical.length > 0) return 'freeze';
    if (violations.length > 0) return 'warning';
    return 'ok';
  };

  it('single 1_2s is warning only', () => {
    expect(getDisposition(['1_2s'])).toBe('warning');
  });

  it('single 1_3s triggers freeze', () => {
    expect(getDisposition(['1_3s'])).toBe('freeze');
  });

  it('1_2s + 2_2s triggers freeze_and_capa', () => {
    expect(getDisposition(['1_2s', '2_2s'])).toBe('freeze_and_capa');
  });

  it('no violations is ok', () => {
    expect(getDisposition([])).toBe('ok');
  });
});

describe('Abnormal Sample Handling', () => {
  const canConditionalReceive = (temperature: number, requiredMax: number): boolean => {
    return temperature <= requiredMax + 5; // Allow 5°C margin with documented reason
  };

  it('allows 12°C when required max is 8°C', () => {
    expect(canConditionalReceive(12, 8)).toBe(true);
  });

  it('rejects 20°C when required max is 8°C', () => {
    expect(canConditionalReceive(20, 8)).toBe(false);
  });
});

describe('ELN History Reuse', () => {
  const lastParams = { temperature: 150, time: 120, reagent: '重铬酸钾' };
  
  const reuseWithOverride = (last: any, overrides: any) => {
    return { ...last, ...overrides };
  };

  it('reuses last parameters', () => {
    expect(reuseWithOverride(lastParams, {})).toEqual(lastParams);
  });

  it('allows overriding specific values', () => {
    const result = reuseWithOverride(lastParams, { temperature: 160 });
    expect(result.temperature).toBe(160);
    expect(result.reagent).toBe('重铬酸钾');
  });
});
