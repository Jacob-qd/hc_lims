import React, { useState } from 'react';
import {Card, Row, Col, Typography, Statistic, Table, Space, Select, DatePicker, Drawer, Button} from 'antd';
import { Line, Pie, Bar } from '@ant-design/plots';
import { SettingOutlined, BarChartOutlined, PieChartOutlined, LineChartOutlined, TableOutlined, SaveOutlined, ArrowUpOutlined, ArrowDownOutlined, ExportOutlined, DownloadOutlined } from '@ant-design/icons';


const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const trendData = [
  { month: '1月', samples: 420, reports: 380, tat: 3.2 },
  { month: '2月', samples: 380, reports: 350, tat: 3.5 },
  { month: '3月', samples: 510, reports: 480, tat: 2.8 },
  { month: '4月', samples: 480, reports: 450, tat: 3.0 },
  { month: '5月', samples: 560, reports: 520, tat: 2.6 },
];

const topClients = [
  { name: '绿源环保', samples: 248, reports: 220, revenue: '¥496,000' },
  { name: '博克水务', samples: 196, reports: 185, revenue: '¥392,000' },
  { name: '清源化工', samples: 128, reports: 115, revenue: '¥256,000' },
  { name: '蓝天监测站', samples: 96, reports: 90, revenue: '¥192,000' },
  { name: '宏达食品', samples: 78, reports: 72, revenue: '¥156,000' },
];

const labWorkload = [
  { lab: '理化实验室', samples: 420, tasks: 380, completion: 92 },
  { lab: '仪器分析室', samples: 280, tasks: 260, completion: 88 },
  { lab: '无机分析室', samples: 190, tasks: 175, completion: 85 },
  { lab: '环境监测室', samples: 150, tasks: 140, completion: 90 },
  { lab: '微生物实验室', samples: 85, tasks: 80, completion: 94 },
];

const sampleTypeDist = [
  { type: '环境水', count: 480 }, { type: '土壤', count: 279 },
  { type: '废水', count: 196 }, { type: '空气', count: 152 },
  { type: '饮用水', count: 76 }, { type: '其他', count: 65 },
];

const testItemDist = [
  { item: '化学需氧量(COD)', count: 356 },
  { item: '氨氮', count: 289 },
  { item: 'pH值', count: 245 },
  { item: '重金属(Pb)', count: 198 },
  { item: '总磷(TP)', count: 167 },
  { item: '悬浮物(SS)', count: 145 },
];

export const StatisticsPage: React.FC = () => {
  const [designerOpen, setDesignerOpen] = useState(false);
  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>数据分析</Title></Col>
        <Col>
          <Space>
            <Button icon={<ExportOutlined />} onClick={() => { const csv='指标,数值\n本月样品量,560\n平均周转时间,2.6天\n报告按时率,94.2%\n仪器利用率,63.2%'; const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='statistics_export.csv'; a.click(); message.success('数据已导出为CSV'); }}>导出报表</Button>
            <RangePicker />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部实验室</Select.Option>
              <Select.Option value="l2">理化实验室</Select.Option>
              <Select.Option value="l3">仪器分析室</Select.Option>
            </Select>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="本月样品量" value={560} suffix="个" prefix={<Text style={{ color: '#52c41a', fontSize: 14 }}>↑ 16.7%</Text>} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="平均周转时间" value={2.6} suffix="天" prefix={<Text style={{ color: '#52c41a', fontSize: 14 }}>↓ 0.4</Text>} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="报告按时出具率" value={94.2} suffix="%" prefix={<Text style={{ color: '#52c41a', fontSize: 14 }}>↑ 2.1%</Text>} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="仪器平均利用率" value={63.2} suffix="%" prefix={<Text style={{ color: '#faad14', fontSize: 14 }}>↑ 1.8%</Text>} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card title="样品量趋势（近5月）">
            <Line data={trendData} xField="month" yField="samples" smooth height={220} point={{ size: 4 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card title="检测项目分布 TOP6">
            <Bar data={testItemDist} xField="count" yField="item" height={220} barStyle={{ radius: [2, 2, 0, 0] }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={8} style={{ marginBottom: 16 }}>
          <Card title="样品类型分布">
            <Pie data={sampleTypeDist} angleField="count" colorField="type" radius={0.7} label={{ type: 'outer', content: '{name} {percentage}' }} height={240} />
          </Card>
        </Col>
        <Col xs={24} lg={16} style={{ marginBottom: 16 }}>
          <Card title="客户/项目样品量 TOP5">
            <Table dataSource={topClients} rowKey="name" pagination={false} size="small" columns={[
              { title: '客户名称', dataIndex: 'name' },
              { title: '样品数', dataIndex: 'samples' },
              { title: '报告数', dataIndex: 'reports' },
              { title: '收入', dataIndex: 'revenue' },
            ]} />
          </Card>
        </Col>
      </Row>

      <Card title="各实验室工作量对比">
        <Table dataSource={labWorkload} rowKey="lab" pagination={false} size="small" columns={[
          { title: '实验室', dataIndex: 'lab' },
          { title: '样品数', dataIndex: 'samples' },
          { title: '任务数', dataIndex: 'tasks' },
          { title: '完成率', dataIndex: 'completion', render: (v: number) => <Text style={{ color: v > 90 ? '#52c41a' : v > 80 ? '#faad14' : '#ff4d4f' }}>{v}%</Text> },
        ]} />
      </Card>
      <Drawer title={<span><SettingOutlined /> 分析看板设计器</span>} open={designerOpen} onClose={() => setDesignerOpen(false)} width={400}
        extra={<Button type="primary" icon={<SaveOutlined />} onClick={() => { localStorage.setItem('dashboard_designer_open','1'); message.success('配置已保存'); }}>保存配置</Button>}>
        <Text type="secondary" style={{display:'block',marginBottom:16}}>选择图表组件，使用 ↑↓ 调整顺序</Text>
        {[
          {key:'trend',label:'样品量趋势',icon:<LineChartOutlined />,desc:'近5月折线图'},
          {key:'items',label:'检测项目分布',icon:<BarChartOutlined />,desc:'TOP6条形图'},
          {key:'distribution',label:'样品类型分布',icon:<PieChartOutlined />,desc:'环形图'},
          {key:'top5',label:'客户TOP5',icon:<TableOutlined />,desc:'表格'},
          {key:'lab',label:'实验室对比',icon:<BarChartOutlined />,desc:'工作量对比'},
        ].map((w,i) => (
          <Card key={w.key} size="small" style={{marginBottom:8}}>
            <Row align="middle" justify="space-between">
              <Col><Space>{w.icon}<Text strong>{w.label}</Text><Text type="secondary" style={{fontSize:12}}>{w.desc}</Text></Space></Col>
              <Col><Space><Button size="small" disabled={i===0}><ArrowUpOutlined /></Button><Button size="small" disabled={i===4}><ArrowDownOutlined /></Button></Space></Col>
            </Row>
          </Card>
        ))}
      </Drawer>
    </div>
  );
};
