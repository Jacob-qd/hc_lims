import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, Drawer, Descriptions, Tabs, message, Modal, Form, Tooltip, Badge } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, DownloadOutlined, FileTextOutlined, TrophyOutlined, BookOutlined, FilePdfOutlined, CopyOutlined } from '@ant-design/icons';
import { exportCSV, exportPDF, exportJSON } from '../utils/export';

const { Title, Text } = Typography;
const typeColors: Record<string, string> = { 论文: '#1677ff', 专利: '#52c41a', 报告: '#fa8c16', 数据: '#722ed1' };
const typeIcons: Record<string, any> = { 论文: <BookOutlined />, 专利: <TrophyOutlined />, 报告: <FileTextOutlined /> };

function generateBibTeX(pub: any) {
  const key = pub.authors.split(',')[0].trim() + pub.year;
  if (pub.type === '论文') {
    return `@article{${key},
  title={${pub.title}},
  author={${pub.authors}},
  journal={${pub.journal}},
  year={${pub.year}},
  doi={${pub.doi}}
}`;
  }
  if (pub.type === '专利') {
    return `@patent{${key},
  title={${pub.title}},
  author={${pub.authors}},
  number={${pub.doi}},
  year={${pub.year}}
}`;
  }
  return `@misc{${key},
  title={${pub.title}},
  author={${pub.authors}},
  year={${pub.year}}
}`;
}

function generateGB(pub: any) {
  return `${pub.authors}. ${pub.title}[${pub.type === '论文' ? 'J' : pub.type === '专利' ? 'P' : 'R'}]. ${pub.journal}, ${pub.year}. DOI: ${pub.doi}`;
}

export const AchievementPage: React.FC = () => {
  const [pubs, setPubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetch('/api/v1/research/publications').then(r => r.json()).then(d => { setPubs(d.data?.list || []); setLoading(false); });
  }, []);

  const filtered = pubs.filter((p: any) => {
    const matchSearch = p.title.includes(search) || p.authors.includes(search) || p.journal.includes(search);
    const matchType = !typeFilter || p.type === typeFilter;
    const matchYear = !yearFilter || String(p.year) === yearFilter;
    return matchSearch && matchType && matchYear;
  });
  const stats = { total: pubs.length, papers: pubs.filter((p: any) => p.type === '论文').length, patents: pubs.filter((p: any) => p.type === '专利').length, reports: pubs.filter((p: any) => p.type === '报告').length, published: pubs.filter((p: any) => p.status === 'published').length };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}><Col><Title level={4}>成果管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>新增成果</Button></Col>
      </Row>
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="成果总数" value={stats.total} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="论文" value={stats.papers} valueStyle={{ color: '#1677ff' }} prefix={<BookOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="专利" value={stats.patents} valueStyle={{ color: '#52c41a' }} prefix={<TrophyOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="已发表" value={stats.published} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="搜索标题/作者/期刊" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select placeholder="类型" style={{ width: 120 }} allowClear value={typeFilter} onChange={v => setTypeFilter(v)}>
            {Object.entries(typeColors).map(([k, col]) => <Select.Option key={k} value={k}><Tag color={col}>{k}</Tag></Select.Option>)}
          </Select>
          <Select placeholder="年份" style={{ width: 100 }} allowClear value={yearFilter} onChange={v => setYearFilter(v)}>
            {[2025,2024,2023].map(y => <Select.Option key={y}>{y}</Select.Option>)}
          </Select>
        </Space>
        <Table dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
          { title: '标题', dataIndex: 'title', render: (t: string, r: any) => <a onClick={() => { setSelected(r); setDrawer(true); }}>{t}</a> },
          { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={typeColors[t]} icon={typeIcons[t]}>{t}</Tag> },
          { title: '期刊/专利号', dataIndex: 'journal' },
          { title: '作者', dataIndex: 'authors', ellipsis: true },
          { title: '年份', dataIndex: 'year' },
          { title: 'DOI', dataIndex: 'doi', render: (d: string) => <Text code style={{ fontSize: 11 }}>{d}</Text> },
          { title: '关联项目', dataIndex: 'project' },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'published' ? 'success' : 'warning'} text={s === 'published' ? '已发表' : '审核中'} /> },
          { title: '操作', render: (_: any, r: any) => (
            <Space><Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawer(true); }} />
            <Tooltip title="导出数据"><Button type="link" size="small" icon={<DownloadOutlined />} /></Tooltip></Space>
          )},
        ]} size="middle" />
      </Card>

      <Drawer title={<Space>{selected?.type && <Tag color={typeColors[selected.type]} icon={typeIcons[selected.type]}>{selected.type}</Tag>}{selected?.title}</Space>} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={600}>
        {selected && (<>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="标题" span={2}>{selected.title}</Descriptions.Item>
            <Descriptions.Item label="类型"><Tag color={typeColors[selected.type]}>{selected.type}</Tag></Descriptions.Item>
            <Descriptions.Item label="期刊/专利号">{selected.journal}</Descriptions.Item>
            <Descriptions.Item label="作者">{selected.authors}</Descriptions.Item>
            <Descriptions.Item label="年份">{selected.year}</Descriptions.Item>
            <Descriptions.Item label="DOI">{selected.doi}</Descriptions.Item>
            <Descriptions.Item label="关联项目">{selected.project}</Descriptions.Item>
            <Descriptions.Item label="状态"><Badge status={selected.status === 'published' ? 'success' : 'warning'} text={selected.status === 'published' ? '已发表' : '审核中'} /></Descriptions.Item>
          </Descriptions>
          <Tabs style={{ marginTop: 16 }} items={[
            { key: 'data', label: '关联实验数据', children: (
              <Table dataSource={[{exp:'二维材料表面改性测试',date:'2024-05-20',type:'XPS/AFM数据'},{exp:'标准曲线测定',date:'2024-05-15',type:'光谱数据'}]} rowKey="exp" pagination={false} size="small" columns={[
                {title:'实验名称',dataIndex:'exp'},{title:'日期',dataIndex:'date'},{title:'数据类型',dataIndex:'type'},
                {title:'操作',render:(_:any, r:any) => <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => exportCSV([{实验名称:r.exp,日期:r.date,数据类型:r.type}], r.exp)}>导出</Button>},
              ]} />
            )},
            { key: 'citation', label: '引用格式', children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Card size="small" title="BibTeX" extra={<Button size="small" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(generateBibTeX(selected)); message.success('已复制'); }}>复制</Button>}>
                  <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{generateBibTeX(selected)}</pre>
                </Card>
                <Card size="small" title="GB/T 7714" extra={<Button size="small" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(generateGB(selected)); message.success('已复制'); }}>复制</Button>}>
                  <Text copyable>{generateGB(selected)}</Text>
                </Card>
              </Space>
            )},
            { key: 'export', label: '数据导出', children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                {[{fmt:'CSV',desc:'原始数据表格',icon:<FileTextOutlined />},{fmt:'Excel',desc:'论文作图数据',icon:<FileTextOutlined />},{fmt:'PDF',desc:'完整实验报告',icon:<FilePdfOutlined />}].map(f => (
                  <Card key={f.fmt} size="small" hoverable><Row justify="space-between"><Col><Space>{f.icon}<Text strong>{f.fmt}</Text></Space><br /><Text type="secondary">{f.desc}</Text></Col><Col><Button icon={<DownloadOutlined />} onClick={() => {
                    if (f.fmt === 'CSV') exportCSV(pubs, '成果数据', ['title','authors','journal','year','doi']);
                    else if (f.fmt === 'PDF') exportPDF('成果报告', '成果列表数据导出', '成果报告');
                    else exportJSON(pubs, '成果数据');
                  }}>下载</Button></Col></Row></Card>
                ))}
              </Space>
            )},
          ]} />
        </>)}
      </Drawer>

      <Modal title="新增成果" open={createModal} onOk={() => form.submit()} onCancel={() => { setCreateModal(false); form.resetFields(); }} width={600}>
        <Form form={form} layout="vertical" onFinish={() => { message.success('成果已添加'); setCreateModal(false); }}>
          <Row gutter={16}>
            <Col span={16}><Form.Item name="title" label="标题" required><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="type" label="类型"><Select><Select.Option value="论文">论文</Select.Option><Select.Option value="专利">专利</Select.Option><Select.Option value="报告">报告</Select.Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}><Form.Item name="journal" label="期刊/专利号"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="year" label="年份"><Input type="number" /></Form.Item></Col>
          </Row>
          <Form.Item name="authors" label="作者"><Input /></Form.Item>
          <Form.Item name="doi" label="DOI"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
