import React, { useEffect, useRef } from 'react';
import { Modal, Button, Space, Typography, message } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';

const { Text } = Typography;

interface BarcodeLabelProps {
  visible: boolean;
  onClose: () => void;
  code: string;
  label?: string;
  type?: 'sample' | 'reagent' | 'instrument' | 'report';
}

const typePrefix = { sample: 'SMP', reagent: 'RE', instrument: 'INS', report: 'RPT' };

export const BarcodePreview: React.FC<{ code: string; label?: string; height?: number }> = ({ code, label, height = 50 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, code, {
          format: 'CODE128',
          width: 1.5,
          height,
          displayValue: true,
          fontSize: 14,
          margin: 5,
        });
      } catch { /* ignore invalid codes */ }
    }
  }, [code, height]);

  return (
    <div style={{ textAlign: 'center', padding: 8 }}>
      <svg ref={svgRef} style={{ maxWidth: '100%' }} />
      {label && <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>{label}</Text>}
    </div>
  );
};

export const generateSampleBarcode = (index: number): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `SMP${date}${String(index).padStart(4, '0')}`;
};

export const BarcodePrintModal: React.FC<BarcodeLabelProps> = ({ visible, onClose, code, label, type = 'sample' }) => {
  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>打印条码</title><style>body{text-align:center;padding:20px}svg{max-width:100%}</style></head><body>`);
      win.document.write(document.getElementById('barcode-print-content')?.innerHTML || '');
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
  };

  return (
    <Modal title={<span><PrinterOutlined /> 条码预览</span>} open={visible} onCancel={onClose} width={400} footer={
      <Space><Button onClick={onClose}>关闭</Button><Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>打印</Button></Space>
    }>
      <div id="barcode-print-content">
        <BarcodePreview code={code} label={label} height={60} />
      </div>
      <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>编码: {code} | 类型: {type === 'sample' ? '样品' : type === 'reagent' ? '试剂' : type === 'instrument' ? '仪器' : '报告'}</Text>
      </div>
    </Modal>
  );
};

export const BatchBarcodePrint: React.FC<{ visible: boolean; onClose: () => void; codes: { code: string; label: string }[] }> = ({ visible, onClose, codes }) => {
  const handlePrintAll = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>批量打印条码</title><style>body{padding:20px}.item{display:inline-block;width:200px;text-align:center;margin:10px;page-break-inside:avoid}</style></head><body>`);
      codes.forEach(c => {
        const svgId = `barcode-${c.code}`;
        const svg = document.getElementById(svgId);
        win.document.write(`<div class="item">${svg?.outerHTML || ''}<br/>${c.label}</div>`);
      });
      win.document.write('</body></html>');
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  return (
    <Modal title="批量条码打印" open={visible} onCancel={onClose} width={500} footer={
      <Space><Button onClick={onClose}>取消</Button><Button type="primary" icon={<PrinterOutlined />} onClick={handlePrintAll}>打印全部 ({codes.length}张)</Button></Space>
    }>
      <Space wrap>
        {codes.map(c => <div key={c.code} style={{ width: 180, border: '1px solid #f0f0f0', borderRadius: 4, padding: 8 }}>
          <BarcodePreview code={c.code} height={40} />
          <Text type="secondary" style={{ fontSize: 11 }}>{c.label}</Text>
        </div>)}
      </Space>
    </Modal>
  );
};
