import React, { useEffect, useState } from 'react';
import {
  Card, List, Tag, Typography, Space, message, Progress, Button, Empty,
} from 'antd';
import {
   ClockCircleOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: '待处理' },
  in_progress: { color: 'blue', label: '进行中' },
  assigned: { color: 'purple', label: '已分配' },
  completed: { color: 'green', label: '已完成' },
};

/** 移动端任务列表 */
export const MobileTaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/tasks').then(r => r.json()).then(d => {
      if (d.code === 200) setTasks(d.data?.list || []);
      setLoading(false);
    }).catch(() => { message.error('加载失败'); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', padding: '12px 12px 80px' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>我的任务</Title>
        <Button size="small" onClick={() => { setLoading(true); fetch('/api/v1/tasks').then(r => r.json()).then(d => { if (d.code === 200) setTasks(d.data?.list || []); setLoading(false); }); }}>
          刷新
        </Button>
      </div>

      <List
        dataSource={tasks}
        loading={loading}
        renderItem={(t: any) => (
          <Card
            size="small" hoverable
            style={{ marginBottom: 8, borderRadius: 12 }}
            onClick={() => navigate('/tasks')}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 14 }}>{t.sampleName}</Text>
                <Tag color={statusMap[t.status]?.color || 'default'} style={{ fontSize: 10 }}>
                  {statusMap[t.status]?.label || t.status}
                </Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>{t.testItem}</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  <ClockCircleOutlined /> {t.createdAt}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{t.analystName}</Text>
              </div>
              {t.progress != null && (
                <Progress percent={t.progress} size="small" />
              )}
            </Space>
          </Card>
        )}
        locale={{ emptyText: <Empty description="暂无任务" /> }}
      />
    </div>
  );
};
