import React, { useState } from 'react';
import { Card, Tag, Tabs, Row, Col, Typography, Badge, Button, Space, message } from 'antd';
import { BellOutlined, CheckCircleOutlined, DeleteOutlined, ExclamationCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockNotifications = [
  { id: 'n1', title: '有27个任务已逾期', desc: '请及时处理逾期任务', type: 'error', time: '10:15', module: '检测管理', read: false },
  { id: 'n2', title: '仪器ICP-001维护中', desc: '预计恢复时间: 2024-05-22 14:00', type: 'warning', time: '09:40', module: '仪器管理', read: false },
  { id: 'n3', title: '新版本发布', desc: '红创LIMS 2.3.1版本已发布', type: 'info', time: '昨天', module: '系统管理', read: false },
  { id: 'n4', title: '报告批准通知', desc: '报告编号RPT20240520022已批准', type: 'success', time: '昨天', module: '报告管理', read: true },
  { id: 'n5', title: '校准到期提醒', desc: '电子天平ME204E校准证书已过期', type: 'warning', time: '2024-05-19', module: '仪器管理', read: true },
  { id: 'n6', title: '质控失控通知', desc: 'COD质控样品超出±3SD限', type: 'error', time: '2024-05-18', module: '质量控制', read: true },
  { id: 'n7', title: '样品接收完成', desc: 'SMP20240521001 已接收', type: 'success', time: '2024-05-18', module: '样品管理', read: true },
  { id: 'n8', title: '采购申请待审批', desc: 'PR-2025-001 待审批', type: 'info', time: '2024-05-17', module: '库存管理', read: true },
];

const typeIcons: Record<string, LooseAny> = { error: <ExclamationCircleOutlined style={{color:'#ff4d4f'}} />, warning: <WarningOutlined style={{color:'#faad14'}} />, info: <InfoCircleOutlined style={{color:'#1677ff'}} />, success: <CheckCircleOutlined style={{color:'#52c41a'}} /> };

export const NotificationPage: React.FC = () => {
  const [notifs, setNotifs] = useState(mockNotifications);
  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => { setNotifs(notifs.map(n => ({ ...n, read: true }))); message.success('全部标为已读'); };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}><BellOutlined /> 消息通知 <Badge count={unread} style={{marginLeft:8}} /></Title></Col>
        <Col><Button onClick={markAllRead} icon={<CheckCircleOutlined />}>全部标为已读</Button></Col>
      </Row>

      <Tabs defaultActiveKey="unread" items={[
        { key: 'unread', label: `未读 (${unread})`, children: <div>
          {notifs.filter(n => !n.read).map(n => (
            <Card key={n.id} size="small" style={{ marginBottom: 8 }} hoverable>
              <Row align="middle" justify="space-between">
                <Col span={1}>{typeIcons[n.type]}</Col>
                <Col span={16}>
                  <Text strong>{n.title}</Text><br />
                  <Text type="secondary">{n.desc}</Text>
                </Col>
                <Col span={4}><Tag>{n.module}</Tag></Col>
                <Col span={2}><Text type="secondary" style={{fontSize:12}}>{n.time}</Text></Col>
                <Col span={1}><Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => { setNotifs(notifs.map(x => x.id === n.id ? {...x, read:true} : x)); }} /></Col>
              </Row>
            </Card>
          ))}
          {notifs.filter(n => !n.read).length === 0 && <Text type="secondary">暂无未读消息</Text>}
        </div>},
        { key: 'all', label: '全部', children: <div>
          {notifs.map(n => (
            <Card key={n.id} size="small" style={{ marginBottom: 8, opacity: n.read ? 0.6 : 1 }} hoverable>
              <Row align="middle" justify="space-between">
                <Col span={1}>{typeIcons[n.type]}</Col>
                <Col span={16}>
                  <Space>{!n.read && <Badge status="processing" color="#1677ff" />}<Text strong={!n.read}>{n.title}</Text></Space><br />
                  <Text type="secondary">{n.desc}</Text>
                </Col>
                <Col span={4}><Tag>{n.module}</Tag></Col>
                <Col span={2}><Text type="secondary" style={{fontSize:12}}>{n.time}</Text></Col>
                <Col span={1}><Button type="link" size="small" icon={<DeleteOutlined />} /></Col>
              </Row>
            </Card>
          ))}
        </div>},
      ]} />
    </div>
  );
};
