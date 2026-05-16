import React from 'react';
import { Space, Button, Dropdown, message, Modal } from 'antd';
import { DownOutlined, ExportOutlined, ImportOutlined, DeleteOutlined } from '@ant-design/icons';

interface BatchActionsProps {
  selectedCount: number;
  onBatchStatus?: (status: string) => void;
  onBatchDelete?: () => void;
  onBatchExport?: () => void;
  onBatchImport?: () => void;
  statusOptions?: { value: string; label: string; color: string }[];
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  selectedCount,
  onBatchStatus,
  onBatchDelete,
  onBatchExport,
  onBatchImport,
  statusOptions,
}) => {
  if (selectedCount === 0) return (
    <Space>
      {onBatchImport && <Button size="small" icon={<ImportOutlined />} onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = () => message.success('数据导入中...');
        input.click();
      }}>导入</Button>}
      {onBatchExport && <Button size="small" icon={<ExportOutlined />} onClick={() => message.success('数据已导出')}>导出</Button>}
    </Space>
  );

  return (
    <Space>
      <span style={{ fontSize: 13, color: '#1677ff' }}>已选 {selectedCount} 项</span>
      {onBatchStatus && statusOptions && (
        <Dropdown menu={{ items: statusOptions.map(s => ({
          key: s.value,
          label: s.label,
          onClick: () => Modal.confirm({ title: '批量状态变更', content: `确认将 ${selectedCount} 项状态改为「${s.label}」？`, onOk: () => { message.success(`${selectedCount} 项已更新为「${s.label}」`); onBatchStatus(s.value); } })
        })) }}>
          <Button size="small">批量状态 <DownOutlined /></Button>
        </Dropdown>
      )}
      {onBatchDelete && <Button size="small" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({ title: '批量删除', content: `确认删除选中的 ${selectedCount} 项？`, onOk: () => { message.success(`已删除 ${selectedCount} 项`); onBatchDelete(); } })}>删除</Button>}
      {onBatchExport && <Button size="small" icon={<ExportOutlined />} onClick={() => message.success(`已导出 ${selectedCount} 条数据`)}>导出选中</Button>}
    </Space>
  );
};

export const RowSelectionPreset = {
  columnWidth: 40,
  fixed: true as const,
};
