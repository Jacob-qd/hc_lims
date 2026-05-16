import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BatchActions, RowSelectionPreset } from '../components/BatchActions';
import { BarcodePreview, generateSampleBarcode, BarcodePrintModal, BatchBarcodePrint } from '../components/BarcodeLabel';
import { CustomWorkspace } from '../components/CustomWorkspace';
import { SignaturePad, SignatureDisplay } from '../components/SignaturePad';

describe('BatchActions', () => {
  it('未选择时显示导入导出', () => {
    render(<BatchActions selectedCount={0} onBatchExport={() => {}} onBatchImport={() => {}} />);
    expect(screen.getByText('导入')).toBeTruthy();
    expect(screen.getByText('导出')).toBeTruthy();
  });

  it('选择时显示批量操作', () => {
    render(
      <BatchActions
        selectedCount={3}
        onBatchStatus={() => {}}
        onBatchDelete={() => {}}
        onBatchExport={() => {}}
        statusOptions={[{ value: 'active', label: '启用', color: 'green' }]}
      />
    );
    expect(screen.getByText('已选 3 项')).toBeTruthy();
    expect(screen.getByText('批量状态')).toBeTruthy();
    expect(screen.getByText('删除')).toBeTruthy();
    expect(screen.getByText('导出选中')).toBeTruthy();
  });

  it('RowSelectionPreset有固定宽度', () => {
    expect(RowSelectionPreset.columnWidth).toBe(40);
    expect(RowSelectionPreset.fixed).toBe(true);
  });
});

describe('BarcodeLabel', () => {
  it('BarcodePreview渲染不崩溃', () => {
    const { container } = render(<BarcodePreview code="SMP202405210001" label="测试样品" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('生成样品条码', () => {
    const code = generateSampleBarcode(1);
    expect(code.startsWith('SMP')).toBe(true);
    expect(code.length).toBeGreaterThan(10);
  });

  it('BarcodePrintModal渲染', () => {
    const { baseElement } = render(<BarcodePrintModal visible={true} onClose={() => {}} code="SMP001" label="测试" type="sample" />);
    expect(baseElement.textContent).toContain('条码预览');
    expect(baseElement.textContent).toContain('打印');
    expect(baseElement.textContent).toContain('关');
  });

  it('BatchBarcodePrint渲染', () => {
    render(<BatchBarcodePrint visible={true} onClose={() => {}} codes={[{ code: 'SMP001', label: '样品1' }, { code: 'SMP002', label: '样品2' }]} />);
    expect(screen.getByText('批量条码打印')).toBeTruthy();
    expect(screen.getByText('打印全部 (2张)')).toBeTruthy();
  });
});

describe('CustomWorkspace', () => {
  it('渲染自定义工作台', () => {
    render(<CustomWorkspace open={true} onClose={() => {}} onSave={() => {}} initialVisible={['kpi', 'recent_samples']} />);
    expect(screen.getByText('自定义工作台')).toBeTruthy();
    expect(screen.getByText('保存布局')).toBeTruthy();
    expect(screen.getByText('KPI 卡片')).toBeTruthy();
  });

  it('切换显示状态', () => {
    render(<CustomWorkspace open={true} onClose={() => {}} onSave={() => {}} initialVisible={['kpi']} />);
    const switches = document.querySelectorAll('.ant-switch');
    expect(switches.length).toBeGreaterThan(0);
  });
});

describe('SignaturePad', () => {
  it('渲染签名弹窗', () => {
    render(<SignaturePad visible={true} onClose={() => {}} onSign={() => {}} type="编制" userName="张伟" userRole="检测员" />);
    expect(screen.getByText('电子签名 — 编制')).toBeTruthy();
    expect(screen.getByText('张伟')).toBeTruthy();
    expect(screen.getByText('检测员')).toBeTruthy();
  });

  it('SignatureDisplay渲染', () => {
    const sig = { user: '张伟', role: '检测员', timestamp: '2026-05-15 10:00', ip: '192.168.1.1', type: '编制' as const };
    render(<SignatureDisplay signature={sig} />);
    expect(screen.getByText('编制')).toBeTruthy();
    expect(screen.getByText('张伟')).toBeTruthy();
  });
});
