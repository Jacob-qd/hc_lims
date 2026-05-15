import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Modal, Form, Input, Select, DatePicker, InputNumber, message, Progress, Switch, Timeline, Alert, Upload, Descriptions } from 'antd';
import { CloudDownloadOutlined, DatabaseOutlined, ReloadOutlined, ClockCircleOutlined, HistoryOutlined, ExportOutlined, ImportOutlined, SettingOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockBackups = [
  { id: 'b1', name: 'hc_lims_full_20260514_120000.sql', size: '256MB', type: '自动全量', date: '2024-05-14 12:00', status: 'completed', duration: '3min 24s', checksum: 'a3f8...c921 ✅' },
  { id: 'b2', name: 'hc_lims_inc_20260514_060000.sql', size: '12MB', type: '自动增量', date: '2024-05-14 06:00', status: 'completed', duration: '28s', checksum: 'b7e1...d45a ✅' },
  { id: 'b3', name: 'hc_lims_full_20260513_120000.sql', size: '248MB', type: '自动全量', date: '2024-05-13 12:00', status: 'completed', duration: '3min 10s', checksum: 'c412...f830 ✅' },
  { id: 'b4', name: 'hc_lims_data_20260512_180000.json', size: '45MB', type: '手动导出', date: '2024-05-12 18:00', status: 'completed', duration: '8s', checksum: '-' },
  { id: 'b5', name: 'hc_lims_full_20260511_120000.sql', size: '235MB', type: '自动全量', date: '2024-05-11 12:00', status: 'completed', duration: '3min 5s', checksum: 'd903...a712 ✅' },
  { id: 'b6', name: 'hc_lims_full_20260510_120000.sql', size: '231MB', type: '自动全量', date: '2024-05-10 12:00', status: 'completed', duration: '3min 0s', checksum: 'e124...b893 ✅' },
];

const mockExportHistory = [
  { id: 'e1', module: '样品数据', format: 'Excel', records: 1245, time: '2024-05-15 10:00', operator: '张伟', status: 'completed' },
  { id: 'e2', module: '报告数据', format: 'JSON', records: 1180, time: '2024-05-14 16:00', operator: '李思', status: 'completed' },
  { id: 'e3', module: '检测结果', format: 'CSV', records: 3200, time: '2024-05-13 09:00', operator: '王强', status: 'completed' },
];

export const BackupPage: React.FC = () => {
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [restoreVisible, setRestoreVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingup, setIsBackingup] = useState(false);

  const handleManualBackup = () => {
    setIsBackingup(true);
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setIsBackingup(false); message.success('手动备份完成！'); return 100; }
        return prev + Math.random() * 30;
      });
    }, 500);
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><DatabaseOutlined /> 数据备份与恢复</Title></Col>
        <Col><Space>
          <Button icon={<ExportOutlined />} onClick={() => setExportVisible(true)}>导出数据</Button>
          <Button icon={<HistoryOutlined />} onClick={() => setRestoreVisible(true)}>数据恢复</Button>
          <Button type="primary" icon={<CloudDownloadOutlined />} onClick={handleManualBackup} loading={isBackingup}>立即备份</Button>
        </Space></Col>
      </Row>

      {isBackingup && (
        <Alert message={`备份进行中... ${Math.round(backupProgress)}%`} type="info" showIcon style={{ marginBottom: 16 }} />
      )}

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="备份总数" value={mockBackups.length} prefix={<DatabaseOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="最近全量备份" value="05-14 12:00" prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="备份总大小" value="1.27GB" prefix={<CloudDownloadOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="备份成功率" value="100%" prefix={<SafetyOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="backups" items={[
        {
          key: 'backups', label: '备份记录', children: <Card extra={
            <Space><Button size="small" icon={<SettingOutlined />} onClick={() => setScheduleVisible(true)}>备份策略</Button></Space>
          }>
            <Table dataSource={mockBackups} rowKey="id" pagination={{ size: 'small', pageSize: 8 }} columns={[
              { title: '文件名', dataIndex: 'name', ellipsis: true },
              { title: '大小', dataIndex: 'size', width: 80 },
              { title: '类型', dataIndex: 'type', width: 100, render: (t: string) => <Tag color={t.includes('全量') ? 'blue' : t.includes('增量') ? 'green' : 'orange'}>{t}</Tag> },
              { title: '时间', dataIndex: 'date', width: 130 },
              { title: '耗时', dataIndex: 'duration', width: 80 },
              { title: '校验', dataIndex: 'checksum', width: 140, render: (c: string) => c.includes('✅') ? <Tag color="green">{c}</Tag> : <Text type="secondary">{c}</Text> },
              { title: '状态', dataIndex: 'status', width: 80, render: () => <Tag color="green">完成</Tag> },
              { title: '操作', width: 160, render: (_: any, r: any) => <Space size="small">
                <Button type="link" size="small" onClick={() => { setRestoreVisible(true); }}>恢复</Button>
                <Button type="link" size="small" onClick={() => message.success(`${r.name} 已开始下载`)}>下载</Button>
                <Button type="link" size="small" danger onClick={() => Modal.confirm({ title: '删除备份', content: `确认删除 ${r.name}？`, onOk: () => message.success('已删除') })}>删除</Button>
              </Space> },
            ]} size="middle" />
          </Card>
        },
        {
          key: 'strategy', label: '备份策略', children: <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }} onFinish={(v) => message.success('备份策略已保存')}>
              <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="全量备份"><Tag color="blue">每天 12:00</Tag> · 保留最近 30 天</Descriptions.Item>
                <Descriptions.Item label="增量备份"><Tag color="green">每 6 小时</Tag> · 保留最近 7 天</Descriptions.Item>
                <Descriptions.Item label="备份路径"><code>/data/backups/hc_lims/</code> (本地) + S3/MinIO 异地</Descriptions.Item>
                <Descriptions.Item label="备份验证"><Tag color="green">自动校验 Checksum (SHA-256)</Tag></Descriptions.Item>
              </Descriptions>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="全量备份时间"><Select defaultValue="12:00"><Select.Option value="00:00">00:00</Select.Option><Select.Option value="06:00">06:00</Select.Option><Select.Option value="12:00">12:00</Select.Option><Select.Option value="18:00">18:00</Select.Option></Select></Form.Item></Col>
                <Col span={12}><Form.Item label="全量保留天数"><InputNumber defaultValue={30} style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="增量备份间隔(h)"><Select defaultValue="6"><Select.Option value="1">1小时</Select.Option><Select.Option value="3">3小时</Select.Option><Select.Option value="6">6小时</Select.Option><Select.Option value="12">12小时</Select.Option></Select></Form.Item></Col>
                <Col span={12}><Form.Item label="增量保留天数"><InputNumber defaultValue={7} style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
              <Form.Item label="启用异地备份(S3/MinIO)"><Switch defaultChecked /></Form.Item>
              <Form.Item label="S3端点"><Input placeholder="https://s3.amazonaws.com" /></Form.Item>
              <Button type="primary" htmlType="submit">保存策略</Button>
            </Form>
          </Card>
        },
        {
          key: 'export', label: '数据导出', children: <Card extra={<Button icon={<ExportOutlined />} onClick={() => setExportVisible(true)}>新建导出</Button>}>
            <Table dataSource={mockExportHistory} rowKey="id" columns={[
              { title: '导出模块', dataIndex: 'module' },
              { title: '格式', dataIndex: 'format', render: (f: string) => <Tag>{f}</Tag> },
              { title: '记录数', dataIndex: 'records' },
              { title: '时间', dataIndex: 'time' },
              { title: '操作人', dataIndex: 'operator' },
              { title: '状态', dataIndex: 'status', render: () => <Tag color="green">完成</Tag> },
              { title: '操作', render: () => <Space><Button type="link" size="small">下载</Button><Button type="link" size="small">重新导出</Button></Space> },
            ]} pagination={false} size="middle" />
          </Card>
        },
      ]} />

      {/* Schedule Modal */}
      <Modal title="备份策略配置" open={scheduleVisible} onCancel={() => setScheduleVisible(false)} footer={null}>
        <Form layout="vertical" onFinish={() => { message.success('策略已更新'); setScheduleVisible(false); }}>
          <Form.Item label="自动全量备份"><Switch defaultChecked /> <Text type="secondary">每日定时全量备份</Text></Form.Item>
          <Form.Item label="自动增量备份"><Switch defaultChecked /> <Text type="secondary">增量备份变更数据</Text></Form.Item>
          <Form.Item label="备份验证"><Switch defaultChecked /> <Text type="secondary">自动校验备份文件完整性</Text></Form.Item>
          <Form.Item label="异地备份"><Switch defaultChecked /> <Text type="secondary">自动同步到S3/MinIO</Text></Form.Item>
          <Form.Item label="定期恢复演练"><Switch /> <Text type="secondary">每月自动恢复测试</Text></Form.Item>
          <Button type="primary" htmlType="submit" block>保存</Button>
        </Form>
      </Modal>

      {/* Restore Modal */}
      <Modal title="数据恢复" open={restoreVisible} onCancel={() => setRestoreVisible(false)} footer={null}>
        <Alert message="⚠️ 恢复操作将覆盖当前数据库，请确认已做好当前数据备份" type="warning" showIcon style={{ marginBottom: 16 }} />
        <Form layout="vertical" onFinish={() => { message.success('数据恢复任务已提交，请等待完成'); setRestoreVisible(false); }}>
          <Form.Item label="选择备份点" required>
            <Select options={mockBackups.map(b => ({ value: b.id, label: `${b.name} (${b.date})` }))} />
          </Form.Item>
          <Form.Item label="恢复到"><Select defaultValue="production"><Select.Option value="production">生产环境</Select.Option><Select.Option value="staging">测试环境</Select.Option></Select></Form.Item>
          <Button type="primary" danger block htmlType="submit">确认恢复</Button>
        </Form>
      </Modal>

      {/* Export Modal */}
      <Modal title="导出数据" open={exportVisible} onCancel={() => setExportVisible(false)} footer={null}>
        <Form layout="vertical" onFinish={() => { message.success('导出任务已提交'); setExportVisible(false); }}>
          <Form.Item label="导出模块" required>
            <Select mode="multiple" defaultValue={['samples']} options={[
              { value: 'samples', label: '样品数据' }, { value: 'tasks', label: '检测任务' },
              { value: 'reports', label: '报告数据' }, { value: 'quality', label: '质控数据' },
              { value: 'instruments', label: '仪器数据' }, { value: 'personnel', label: '人员数据' },
            ]} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="开始日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="结束日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item label="导出格式"><Select defaultValue="excel"><Select.Option value="excel">Excel (.xlsx)</Select.Option><Select.Option value="csv">CSV</Select.Option><Select.Option value="json">JSON</Select.Option></Select></Form.Item>
          <Button type="primary" block htmlType="submit">开始导出</Button>
        </Form>
      </Modal>
    </div>
  );
};
