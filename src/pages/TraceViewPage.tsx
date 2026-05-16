import React, { useState } from 'react';
import {Card, Timeline, Tag, Descriptions, Button, Row, Col, Typography, Space, Input, Steps} from 'antd';
import { SearchOutlined, LinkOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockTraceData = [
  { id: 't1', reportNo: 'RPT-20260521-001', chain: [
    { step: '委托', id: 'ORD-20260516-001', time: '2026-05-16 09:15', user: '张伟', action: '创建委托', detail: '客户: 绿源环保 · 项目: 地表水监测 · 12样品' },
    { step: '收样', id: 'SMP-20260521-001', time: '2026-05-21 09:15', user: '张伟', action: '样品接收', detail: '地表水样品-1 · PE瓶1L · 4℃冷藏' },
    { step: '分样', id: 'SMP-20260521-001-A', time: '2026-05-21 10:00', user: '张伟', action: '分样', detail: '子样A: 200mL→理化实验室(COD+氨氮)' },
    { step: '检测', id: 'TK-2026-002', time: '2026-05-21 10:30', user: '王明', action: '检测执行', detail: 'COD=25.6 mg/L (HJ 828-2017) · 符合' },
    { step: 'ELN', id: 'ELN-20260521-001', time: '2026-05-21 14:00', user: '王明', action: '实验记录', detail: '模板: COD检测模板 v2.1 · 消解温度150℃' },
    { step: '复核', id: '-', time: '2026-05-21 15:00', user: '王强', action: '数据审核', detail: '审核通过 · 无偏差' },
    { step: '报告', id: 'RPT-20260521-001', time: '2026-05-21 16:00', user: '李思', action: '报告签发', detail: '编制→审核→批准→SM2签名 · 已签发' },
  ]},
];

const stepColors: Record<string, string> = { '委托': '#1677ff', '收样': '#2f54eb', '分样': '#722ed1', '检测': '#52c41a', 'ELN': '#13c2c2', '复核': '#fa8c16', '报告': '#52c41a' };

export const TraceViewPage: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [traceResult, setTraceResult] = useState<any>(null);

  const handleSearch = () => {
    const found = mockTraceData.find(t => 
      t.reportNo.includes(searchId) || t.chain.some((c:any) => c.id.includes(searchId))
    );
    if (found) { setTraceResult(found); } else { setTraceResult(null); }
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><LinkOutlined /> 跨模块追溯视图 (P1-8)</Title></Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search 
            placeholder="输入报告编号/样品编号/任务编号/委托编号" 
            value={searchId} onChange={e => setSearchId(e.target.value)}
            onSearch={handleSearch} enterButton="追溯" style={{ width: 500 }}
          />
          <Button onClick={() => { setTraceResult(mockTraceData[0]); setSearchId(mockTraceData[0].reportNo); }}>加载示例</Button>
        </Space>
      </Card>

      {traceResult ? (
        <Card title={`追溯链: ${traceResult.reportNo}`}>
          <Steps
            direction="vertical"
            current={traceResult.chain.length - 1}
            items={traceResult.chain.map((c: any) => ({
              title: <Space>
                <Tag color={stepColors[c.step]}>{c.step}</Tag>
                <Text strong>{c.action}</Text>
                <Text type="secondary">{c.time} · {c.user}</Text>
              </Space>,
              description: (
                <Card size="small" style={{ marginTop: 4 }}>
                  <Descriptions size="small" column={2}>
                    <Descriptions.Item label="编号"><code>{c.id}</code></Descriptions.Item>
                    <Descriptions.Item label="操作人">{c.user}</Descriptions.Item>
                    <Descriptions.Item label="详情" span={2}>{c.detail}</Descriptions.Item>
                  </Descriptions>
                </Card>
              ),
              status: 'finish' as const,
            }))}
          />
        </Card>
      ) : (
        <Card><Text type="secondary">输入编号搜索完整的追溯链（委托→样品→分样→检测→ELN→复核→报告→签名）</Text></Card>
      )}
    </div>
  );
};
