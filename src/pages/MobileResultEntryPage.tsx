import React, { useEffect, useState } from 'react';
import {
  Card, Button, Typography, Space, message, Tag, List, Empty,
  Input, Form, Select,
} from 'antd';
import {
  ExperimentOutlined, ArrowLeftOutlined, SaveOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface PendingTask {
  id: string;
  taskNo: string;
  sampleName: string;
  testItem: string;
  method: string;
  status: string;
  statusLabel: string;
}

/** 移动端结果录入 */
export const MobileResultEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PendingTask | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/mobile/tasks?status=testing');
      const data = await res.json();
      if (data.code === 200) setTasks(data.data?.list || []);
    } catch {
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async () => {
    if (!selectedTask) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const res = await fetch(`/api/v1/mobile/tests/${selectedTask.id}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          recordedAt: new Date().toISOString(),
          recordedBy: '移动端用户',
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        message.success('结果录入成功');
        setSelectedTask(null);
        form.resetFields();
        fetchTasks();
      } else {
        message.error(data.message || '录入失败');
      }
    } catch {
      message.error('请完善表单');
    } finally {
      setSubmitting(false);
    }
  };

  // Result entry modal
  if (selectedTask) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => { setSelectedTask(null); form.resetFields(); }} />
          <Title level={5} style={{ margin: 0, flex: 1 }}>结果录入</Title>
        </div>

        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
          <Space direction="vertical" size={0}>
            <Text strong>{selectedTask.sampleName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>检测项: {selectedTask.testItem}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>方法: {selectedTask.method}</Text>
            <Tag color="blue">{selectedTask.taskNo}</Tag>
          </Space>
        </Card>

        <Form form={form} layout="vertical">
          <Form.Item name="resultValue" label="检测结果" rules={[{ required: true, message: '请输入结果' }]}>
            <Input size="large" placeholder="如: 7.25" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Select placeholder="选择单位" options={[
              { value: 'mg/L', label: 'mg/L' },
              { value: 'µg/L', label: 'µg/L' },
              { value: 'pH', label: 'pH' },
              { value: 'mg/kg', label: 'mg/kg' },
              { value: 'μg/m³', label: 'μg/m³' },
              { value: 'dB', label: 'dB' },
              { value: 'CFU/mL', label: 'CFU/mL' },
              { value: '个/L', label: '个/L' },
            ]} />
          </Form.Item>
          <Form.Item name="detectionLimit" label="检出限">
            <Input size="large" placeholder="检出限" />
          </Form.Item>
          <Form.Item name="uncertainty" label="不确定度">
            <Input size="large" placeholder="如: ±0.05" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="特殊情况说明..." />
          </Form.Item>
          <Button type="primary" block size="large" loading={submitting} onClick={handleSubmit} icon={<SaveOutlined />}>
            保存结果
          </Button>
        </Form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>结果录入</Title>
        <Button size="small" onClick={fetchTasks}>刷新</Button>
      </div>

      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <Text type="secondary">选择检测中的任务录入结果</Text>
      </Card>

      <List
        dataSource={tasks}
        loading={loading}
        renderItem={(t) => (
          <Card
            size="small"
            hoverable
            style={{ marginBottom: 8, borderRadius: 12 }}
            onClick={() => setSelectedTask(t)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 14 }}>{t.sampleName}</Text>
                <Tag color="blue" style={{ fontSize: 10 }}>{t.statusLabel}</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>{t.testItem}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>方法: {t.method}</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}><ClockCircleOutlined /> {t.taskNo}</Text>
                <Button size="small" type="primary" icon={<ExperimentOutlined />}>录入</Button>
              </div>
            </Space>
          </Card>
        )}
        locale={{ emptyText: <Empty description="暂无待录入任务" /> }}
      />
    </div>
  );
};
