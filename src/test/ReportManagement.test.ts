import { describe, it, expect } from 'vitest';

// 报告管理核心逻辑测试
// 测试批量签发、报告合并、水印的业务规则

describe('报告管理 — 批量签发业务逻辑', () => {
  type ReportStatus = 'draft' | 'tech_reviewed' | 'issued';
  interface Signature { role: string; name: string; signedAt: string; }

  interface Report {
    id: string; status: ReportStatus; signatures: Signature[];
  }

  function batchSign(reports: Report[], selectedIds: string[]): Report[] {
    return reports.map(r =>
      selectedIds.includes(r.id) && r.status === 'tech_reviewed'
        ? { ...r, status: 'issued' as const, signatures: [...r.signatures, { role: 'approver', name: '批量签发', signedAt: new Date().toISOString() }] }
        : r
    );
  }

  it('批量签发: 待签发报告变为已签发', () => {
    const reports: Report[] = [
      { id: 'r1', status: 'tech_reviewed', signatures: [] },
      { id: 'r2', status: 'tech_reviewed', signatures: [] },
    ];
    const result = batchSign(reports, ['r1', 'r2']);
    expect(result.filter(r => r.status === 'issued').length).toBe(2);
  });

  it('批量签发: 不选择时无变化', () => {
    const reports: Report[] = [
      { id: 'r1', status: 'tech_reviewed', signatures: [] },
    ];
    const result = batchSign(reports, []);
    expect(result[0].status).toBe('tech_reviewed');
  });

  it('批量签发: 仅签发技术审核完成的报告', () => {
    const reports: Report[] = [
      { id: 'r1', status: 'draft', signatures: [] },
      { id: 'r2', status: 'tech_reviewed', signatures: [] },
    ];
    const result = batchSign(reports, ['r1', 'r2']);
    expect(result.find(r => r.id === 'r1')?.status).toBe('draft');
    expect(result.find(r => r.id === 'r2')?.status).toBe('issued');
  });

  it('批量签发: 已签发报告不重复签发', () => {
    const reports: Report[] = [
      { id: 'r1', status: 'issued', signatures: [{ role: 'approver', name: '张伟', signedAt: '2026-05-15' }] },
    ];
    const result = batchSign(reports, ['r1']);
    expect(result[0].signatures.length).toBe(1); // 不应新增签名
  });

  it('批量签发: 空列表不崩溃', () => {
    const result = batchSign([], ['r1']);
    expect(result.length).toBe(0);
  });

  it('批量签发: 添加签名记录', () => {
    const reports: Report[] = [{ id: 'r1', status: 'tech_reviewed', signatures: [] }];
    const result = batchSign(reports, ['r1']);
    expect(result[0].signatures.length).toBe(1);
    expect(result[0].signatures[0].role).toBe('approver');
  });
});

describe('报告管理 — 合并报告逻辑', () => {
  interface Report {
    id: string; status: string; cover?: { reportTitle?: string; companyName?: string; entrustUnit?: string; };
  }

  function createMergedReport(selected: Report[]): Report | null {
    if (selected.length < 2) return null;
    return {
      id: 'merged-' + Date.now(),
      status: 'draft',
      cover: {
        reportTitle: `综合检测报告 (${selected.length}个样品)`,
        companyName: selected[0]?.cover?.companyName || '红创检测',
        entrustUnit: selected[0]?.cover?.entrustUnit || '-',
      },
    };
  }

  it('合并2份报告成功', () => {
    const reports: Report[] = [
      { id: 'r1', status: 'draft', cover: { companyName: '公司A', entrustUnit: '客户A' } },
      { id: 'r2', status: 'draft', cover: { companyName: '公司A', entrustUnit: '客户A' } },
    ];
    const merged = createMergedReport(reports);
    expect(merged).not.toBeNull();
    expect(merged?.cover?.reportTitle).toContain('2个样品');
  });

  it('合并5份报告', () => {
    const reports: Report[] = Array.from({ length: 5 }, (_, i) => ({ id: `r${i}`, status: 'draft' }));
    const merged = createMergedReport(reports);
    expect(merged).not.toBeNull();
    expect(merged?.cover?.reportTitle).toContain('5个样品');
  });

  it('单份报告不能合并', () => {
    const reports: Report[] = [{ id: 'r1', status: 'draft' }];
    expect(createMergedReport(reports)).toBeNull();
  });

  it('空列表不能合并', () => {
    expect(createMergedReport([])).toBeNull();
  });

  it('合并报告继承第一个样品的客户信息', () => {
    const reports: Report[] = [
      { id: 'r1', status: 'draft', cover: { companyName: '红创检测', entrustUnit: '环境监测中心' } },
      { id: 'r2', status: 'draft', cover: { companyName: '红创检测', entrustUnit: '环境监测中心' } },
    ];
    const merged = createMergedReport(reports);
    expect(merged?.cover?.entrustUnit).toBe('环境监测中心');
  });

  it('缺少cover信息时使用默认值', () => {
    const reports: Report[] = [
      { id: 'r1', status: 'draft' },
      { id: 'r2', status: 'draft' },
    ];
    const merged = createMergedReport(reports);
    expect(merged?.cover?.companyName).toBeTruthy();
  });
});

describe('报告管理 — 水印逻辑', () => {
  function shouldShowWatermark(status: string, signatures: { role: string; signedAt: string }[]): { show: boolean; text: string } {
    if (status !== 'issued') return { show: false, text: '' };
    const approver = signatures.find(s => s.role === 'approver');
    const date = approver?.signedAt ? new Date(approver.signedAt).toLocaleDateString('zh-CN') : '';
    return { show: true, text: `已签发 ${date}` };
  }

  it('已签发报告显示水印', () => {
    const result = shouldShowWatermark('issued', [{ role: 'approver', name: '张伟', signedAt: '2026-05-15T10:00:00Z' }]);
    expect(result.show).toBe(true);
    expect(result.text).toContain('已签发');
  });

  it('草稿报告不显示水印', () => {
    const result = shouldShowWatermark('draft', []);
    expect(result.show).toBe(false);
  });

  it('技术审核中不显示水印', () => {
    const result = shouldShowWatermark('tech_reviewed', []);
    expect(result.show).toBe(false);
  });

  it('水印包含签发日期', () => {
    const result = shouldShowWatermark('issued', [{ role: 'approver', name: '张伟', signedAt: '2026-05-15T10:00:00Z' }]);
    expect(result.text).toContain('2026');
  });

  it('无签名记录的水印不含日期', () => {
    const result = shouldShowWatermark('issued', []);
    expect(result.text).toBe('已签发 ');
  });
});
