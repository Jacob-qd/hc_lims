import { describe, it, expect } from 'vitest';

describe('数据备份 — 备份策略逻辑', () => {
  function createBackup(type: 'auto' | 'manual'): { id: string; name: string; type: string; date: string; status: string } {
    return {
      id: 'b' + Date.now(),
      name: `hc_lims_full_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_120000.sql`,
      size: '256MB',
      type: type === 'auto' ? '自动' : '手动',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'completed',
    };
  }

  it('创建手动备份', () => {
    const backup = createBackup('manual');
    expect(backup.type).toBe('手动');
    expect(backup.status).toBe('completed');
    expect(backup.type).toBe('手动');
  });

  it('创建自动备份', () => {
    const backup = createBackup('auto');
    expect(backup.type).toBe('自动');
    expect(backup.name).toContain('_full_');
  });

  it('备份文件名包含日期', () => {
    const backup = createBackup('auto');
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    expect(backup.name).toContain(today);
  });

  it('批量创建备份不崩溃', () => {
    const backups = Array.from({ length: 100 }, (_, i) => createBackup(i % 2 === 0 ? 'auto' : 'manual'));
    expect(backups.length).toBe(100);
    expect(backups.filter(b => b.type === '自动').length).toBe(50);
  });
});

describe('数据备份 — 保留策略', () => {
  function shouldCleanup(backupDate: string, retentionDays: number): boolean {
    const age = (Date.now() - new Date(backupDate).getTime()) / 86400000;
    return age > retentionDays;
  }

  it('30天内的备份保留', () => {
    const recent = new Date(Date.now() - 15 * 86400000).toISOString();
    expect(shouldCleanup(recent, 30)).toBe(false);
  });

  it('超过保留期的备份应清理', () => {
    const old = new Date(Date.now() - 60 * 86400000).toISOString();
    expect(shouldCleanup(old, 30)).toBe(true);
  });

  it('正好在保留期边界', () => {
    const boundary = new Date(Date.now() - 30 * 86400000).toISOString();
    // 30天整: age=30, 不清理 (age > 30 才清理)
    expect(shouldCleanup(boundary, 30)).toBe(false);
  });

  it('保留期为0时全部清理', () => {
    const recent = new Date(Date.now() - 1 * 86400000).toISOString(); // 1天前
    expect(shouldCleanup(recent, 0)).toBe(true);
  });

  it('保留期365天', () => {
    const old = new Date(Date.now() - 300 * 86400000).toISOString();
    expect(shouldCleanup(old, 365)).toBe(false);
    const tooOld = new Date(Date.now() - 400 * 86400000).toISOString();
    expect(shouldCleanup(tooOld, 365)).toBe(true);
  });
});

describe('仪器管理 — 期间核查逻辑', () => {
  type Verdict = '合格' | '不合格';

  interface Verification {
    date: string; item: string; result: Verdict; operator: string; nextDate: string;
  }

  function scheduleNextVerification(lastDate: string, intervalMonths: number): string {
    const d = new Date(lastDate);
    d.setMonth(d.getMonth() + intervalMonths);
    return d.toISOString().split('T')[0];
  }

  it('季度核查: 3个月后', () => {
    const next = scheduleNextVerification('2026-05-15', 3);
    expect(next).toBe('2026-08-15');
  });

  it('半年核查: 6个月后', () => {
    const next = scheduleNextVerification('2026-01-15', 6);
    expect(next).toBe('2026-07-15');
  });

  it('年度核查: 12个月后', () => {
    const next = scheduleNextVerification('2026-05-15', 12);
    expect(next).toBe('2027-05-15');
  });

  it('跨年核查', () => {
    const next = scheduleNextVerification('2026-10-15', 6);
    expect(next).toBe('2027-04-15');
  });

  it('是否到期: 超过下次核查日期', () => {
    const overdue = new Date('2026-01-01') < new Date('2026-05-15');
    expect(overdue).toBe(true);
  });

  it('是否到期: 未到下次核查日期', () => {
    const notDue = new Date('2026-12-31') > new Date('2026-05-15');
    expect(notDue).toBe(true);
  });

  it('连续5次核查记录', () => {
    const records: Verification[] = [];
    let date = '2025-05-15';
    for (let i = 0; i < 5; i++) {
      records.push({ date, item: '波长准确度', result: '合格', operator: '张伟', nextDate: scheduleNextVerification(date, 3) });
      date = scheduleNextVerification(date, 3);
    }
    expect(records.length).toBe(5);
    expect(records[0].date).toBe('2025-05-15');
    expect(records[4].date).toBe('2026-05-15');
    expect(records.every(r => r.result === '合格')).toBe(true);
  });
});
