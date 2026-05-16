import { describe, it, expect } from 'vitest';

describe('Order Validation Rules', () => {
  const validateOrder = (data: any) => {
    const errors: string[] = [];
    if (!data.customerName) errors.push('请选择或输入客户');
    if (!data.projectName) errors.push('请输入项目名称');
    if (!data.sampleCount || data.sampleCount < 1) errors.push('样品数量至少为1');
    return errors;
  };

  it('passes valid order', () => {
    expect(validateOrder({ customerName: '绿源', projectName: '水质检测', sampleCount: 3 })).toEqual([]);
  });

  it('fails without customer', () => {
    expect(validateOrder({ customerName: '', projectName: '水质', sampleCount: 1 })).toContain('请选择或输入客户');
  });

  it('fails without project', () => {
    expect(validateOrder({ customerName: '绿源', projectName: '', sampleCount: 1 })).toContain('请输入项目名称');
  });

  it('fails with zero samples', () => {
    expect(validateOrder({ customerName: '绿源', projectName: '水质', sampleCount: 0 })).toContain('样品数量至少为1');
  });
});

describe('SLA Color Calculation', () => {
  const getSLAColor = (dueDate: string, status: string): string => {
    if (status === 'completed') return '#52c41a';
    const daysLeft = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return '#ff4d4f';
    if (daysLeft <= 2) return '#faad14';
    return '#52c41a';
  };

  it('returns green for completed orders', () => {
    expect(getSLAColor('2020-01-01', 'completed')).toBe('#52c41a');
  });

  it('returns red for overdue orders', () => {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    expect(getSLAColor(yesterday.toISOString().slice(0,10), 'in_progress')).toBe('#ff4d4f');
  });

  it('returns yellow for orders due within 2 days', () => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    expect(getSLAColor(tomorrow.toISOString().slice(0,10), 'in_progress')).toBe('#faad14');
  });

  it('returns green for orders due in future', () => {
    const future = new Date(); future.setDate(future.getDate() + 30);
    expect(getSLAColor(future.toISOString().slice(0,10), 'in_progress')).toBe('#52c41a');
  });
});

describe('Quick Order Price Calculation', () => {
  const calculateTotal = (packagePrice: number, sampleCount: number, isRush: boolean): number => {
    let total = packagePrice * sampleCount;
    if (isRush) total *= 1.5; // 加急费50%
    return total;
  };

  it('calculates normal price', () => {
    expect(calculateTotal(2800, 3, false)).toBe(8400);
  });

  it('adds rush fee', () => {
    expect(calculateTotal(2800, 3, true)).toBe(12600);
  });
});

describe('QC Westgard Rule Detection', () => {
  const check1_2s = (values: number[], mean: number, sd: number): boolean => {
    return values.some(v => Math.abs(v - mean) >= 2 * sd);
  };

  const check1_3s = (values: number[], mean: number, sd: number): boolean => {
    return values.some(v => Math.abs(v - mean) > 3 * sd);
  };

  it('passes when all values within 2s', () => {
    expect(check1_2s([25.1, 25.5, 24.8], 25, 0.5)).toBe(false);
    expect(check1_2s([24.0, 25.0, 26.0], 25, 0.5)).toBe(true);
  });

  it('detects 1_3s violation', () => {
    expect(check1_3s([25.1, 24.5, 27.5], 25, 0.5)).toBe(true);
    expect(check1_3s([25.1, 25.3, 24.8], 25, 0.5)).toBe(false);
  });

  it('1_2s is warning, 1_3s is reject', () => {
    const level = (values: number[], mean: number, sd: number): string => {
      if (check1_3s(values, mean, sd)) return 'reject';
      if (check1_2s(values, mean, sd)) return 'warning';
      return 'ok';
    };
    expect(level([25.1, 25.6, 24.9], 25, 0.5)).toBe('ok');
    expect(level([25.1, 27.0, 24.9], 25, 0.5)).toBe('reject');
    expect(level([24.0, 25.2, 24.9], 25, 0.5)).toBe('warning');
  });
});

describe('Trace Chain Validation', () => {
  const requiredSteps = ['委托', '收样', '检测', '复核', '报告'];
  
  it('complete trace chain has all required steps', () => {
    const chain = ['委托', '收样', '分样', '检测', 'ELN', '复核', '报告'];
    const missing = requiredSteps.filter(s => !chain.includes(s));
    expect(missing).toEqual([]);
  });

  it('incomplete chain detects missing steps', () => {
    const chain = ['委托', '检测', '报告'];
    const missing = requiredSteps.filter(s => !chain.includes(s));
    expect(missing).toEqual(['收样', '复核']);
  });
});

describe('Password Policy (21 CFR Part 11)', () => {
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('密码至少8位');
    if (!/[A-Z]/.test(pwd)) errors.push('至少包含一个大写字母');
    if (!/[a-z]/.test(pwd)) errors.push('至少包含一个小写字母');
    if (!/[0-9]/.test(pwd)) errors.push('至少包含一个数字');
    if (!/[!@#$%^&*]/.test(pwd)) errors.push('至少包含一个特殊字符');
    return errors;
  };

  it('valid password passes all checks', () => {
    expect(validatePassword('Abc123!@')).toEqual([]);
  });

  it('too short password fails', () => {
    expect(validatePassword('Ab1!')).toContain('密码至少8位');
  });

  it('missing uppercase fails', () => {
    expect(validatePassword('abc123!@')).toContain('至少包含一个大写字母');
  });

  it('missing special char fails', () => {
    expect(validatePassword('Abc12345')).toContain('至少包含一个特殊字符');
  });
});
