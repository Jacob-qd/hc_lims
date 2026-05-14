import React from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, message, Modal, Progress } from 'antd';
import { CloudDownloadOutlined, DatabaseOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const backups = [
  { id: 'b1', name: 'hc_lims_full_20260514_120000.sql', size: '256MB', type: '自动', date: '2024-05-14 12:00', status: 'completed' },
  { id: 'b2', name: 'hc_lims_full_20260513_120000.sql', size: '248MB', type: '自动', date: '2024-05-13 12:00', status: 'completed' },
  { id: 'b3', name: 'hc_lims_data_20260512_180000.json', size: '45MB', type: '手动', date: '2024-05-12 18:00', status: 'completed' },
  { id: 'b4', name: 'hc_lims_full_20260511_120000.sql', size: '235MB', type: '自动', date: '2024-05-11 12:00', status: 'completed' },
];

export const BackupPage: React.FC = () => (
  <div>
    <Row justify="space-between" style={{ marginBottom: 16 }}>
      <Col><Title level={4}><DatabaseOutlined /> 数据备份与恢复</Title></Col>
      <Col><Button type="primary" icon={<CloudDownloadOutlined />} onClick={() => message.success('手动备份已启动，请等待完成...')}>立即备份</Button></Col>
    </Row>
    <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
      <Col span={6}><Card size="small"><Statistic title="备份总数" value={backups.length} prefix={<DatabaseOutlined />} /></Card></Col>
      <Col span={6}><Card size="small"><Statistic title="最近备份" value="12:00" prefix={<ClockCircleOutlined />} /></Card></Col>
      <Col span={6}><Card size="small"><Statistic title="总大小" value="784MB" prefix={<CloudDownloadOutlined />} /></Card></Col>
      <Col span={6}><Card size="small"><Statistic title="自动备份" value="每日" prefix={<ReloadOutlined />} /></Card></Col>
    </Row>
    <Card title="备份文件列表" extra={
      <Space><Button size="small" onClick={() => message.success('备份策略: 每日12:00自动全量备份，保留30天')}>备份策略</Button></Space>
    }>
      <Table dataSource={backups} rowKey="id" pagination={false} columns={[
        { title: '文件名', dataIndex: 'name' },
        { title: '大小', dataIndex: 'size' },
        { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={t === '自动' ? 'blue' : 'orange'}>{t}</Tag> },
        { title: '备份时间', dataIndex: 'date' },
        { title: '状态', dataIndex: 'status', render: () => <Tag color="green">完成</Tag> },
        { title: '操作', render: () => <Space><Button type="link" size="small" onClick={() => Modal.confirm({title:'确认恢复',content:'此操作将覆盖现有数据，是否继续？',onOk:()=>message.success('数据已恢复')})}>恢复</Button><Button type="link" size="small" onClick={() => message.success('备份已下载')}>下载</Button></Space> },
      ]} size="middle" />
    </Card>
  </div>
);
