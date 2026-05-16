import React, { useState } from 'react';
import { Drawer, Card, Row, Col, Switch, Tag, Button, Typography, message } from 'antd';
import { SettingOutlined, SaveOutlined, DragOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Widget {
  key: string;
  label: string;
  desc: string;
  defaultVisible: boolean;
}

const allWidgets: Widget[] = [
  { key: 'kpi', label: 'KPI 卡片', desc: '样品总数/待检测/逾期/已完成', defaultVisible: true },
  { key: 'recent_samples', label: '最近样品', desc: '最近5条样品记录', defaultVisible: true },
  { key: 'task_queue', label: '任务队列', desc: '各状态任务数量', defaultVisible: true },
  { key: 'instruments', label: '仪器状态', desc: '仪器运行状态概览', defaultVisible: true },
  { key: 'alerts', label: '系统提醒', desc: '逾期/维护/版本更新', defaultVisible: true },
  { key: 'chart_trend', label: '周转时间趋势图', desc: '近7天折线图', defaultVisible: true },
  { key: 'chart_dist', label: '样品类型分布', desc: '环形分布图', defaultVisible: true },
  { key: 'quick_actions', label: '快速操作', desc: '常用功能入口', defaultVisible: true },
];

export const CustomWorkspace: React.FC<{ open: boolean; onClose: () => void; onSave: (visible: string[]) => void; initialVisible: string[] }> = ({ open, onClose, onSave, initialVisible }) => {
  const [visible, setVisible] = useState<string[]>(initialVisible);
  const toggle = (key: string, checked: boolean) => {
    if (checked) setVisible([...visible, key]);
    else setVisible(visible.filter(k => k !== key));
  };

  const handleSave = () => {
    onSave(visible);
    message.success('工作台布局已保存');
  };

  return (
    <Drawer title={<span><SettingOutlined /> 自定义工作台</span>} open={open} onClose={onClose} width={420} extra={<Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>保存布局</Button>}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>选择要在首页显示的组件，拖拽可调整顺序（长按拖拽手柄）</Text>
      {allWidgets.map((w) => (
        <Card key={w.key} size="small" style={{ marginBottom: 8 }} hoverable>
          <Row align="middle" justify="space-between">
            <Col span={2}><DragOutlined style={{ color: '#d9d9d9', cursor: 'grab' }} /></Col>
            <Col span={14}>
              <Text strong>{w.label}</Text><br />
              <Text type="secondary" style={{ fontSize: 12 }}>{w.desc}</Text>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Switch checked={visible.includes(w.key)} onChange={(c) => toggle(w.key, c)} size="small" />
              {visible.includes(w.key) && <Tag color="green" style={{ marginLeft: 4, fontSize: 10 }}>显示</Tag>}
            </Col>
          </Row>
        </Card>
      ))}
      <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>📌 提示：已隐藏的组件将从首页移除，但数据不会被清除。</Text>
      </div>
    </Drawer>
  );
};
