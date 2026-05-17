import React, { useState, useEffect } from 'react';
import {
  Card, Button, Typography, Space, message, List, Tag, Empty, Input, Modal,
} from 'antd';
import {
  EditOutlined, CheckCircleOutlined, ArrowLeftOutlined,
  SaveOutlined, SendOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface TestTask {
  id: string; taskNo: string; sampleName: string; testItem: string;
  method: string; unit?: string; referenceRange?: string;
  status: string; progress: number;
}

export const MobileResultEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TestTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TestTask | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    fetch('/api/v1/mobile/my-tasks')
      .then(r => r.json())
      .then(d => {
        if (d.code === 200) {
          setTasks(d.data?.list || []);
        }
        setLoading(false);
      })
      .catch(() => { message.error('加载失败'); setLoading(false); });
  }, []);

  const openEntry = (task: TestTask) => {
    setSelectedTask(task);
    setResultValue('');
    setDraftSaved(false);
    setModalOpen(true);
  };

  const saveDraft = () => {
    setDraftSaved(true);
    message.success('草稿已保存');
  };

  const submitResult = async () => {
    if (!selectedTask || !resultValue.trim()) {
      message.warning('请输入检测结果');
      return;
    }
    try {
      const res = await fetch(`/api/v1/mobile/tasks/${selectedTask.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.id,
          result: resultValue,
          enteredAt: new Date().toISOString(),
          enteredBy: '当前用户',
        }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('✅ 结果已提交');
        setModalOpen(false);
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'completed', progress: 100 } : t));
      }
    } catch {
      message.error('提交失败');
    }
  };

  const statusMap: Record<string, { color: string; label: string }> = {
    testing: { color: 'blue', label: '检测中' },
    pending: { color: 'orange', label: '待检测' },
    completed: { color: 'green', label: '已完成' },
    pending_review: { color: 'purple', label: '待审核' },
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', padding: '12px 12px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>结果录入</Title>
      </div>

      <List
        dataSource={tasks}
        loading={loading}
        renderItem={t => (
          <Card
            size="small" hoverable
            style={{ marginBottom: 8, borderRadius: 12, opacity: t.status === 'completed' ? 0.7 : 1 }}
            onClick={() => t.status !== 'completed' && openEntry(t)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag color="blue">{t.taskNo}</Tag>
                  <Text strong style={{ fontSize: 14 }}>{t.sampleName}</Text>
                </Space>
                <Tag color={statusMap[t.status]?.color}>{statusMap[t.status]?.label}</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t.testItem} · {t.method}
              </Text>
              {t.referenceRange && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  参考范围: {t.referenceRange}
                </Text>
              )}
              {t.status === 'completed' ? (
                <Text type="success" style={{ fontSize: 12 }}><CheckCircleOutlined /> 结果已录入</Text>
              ) : (
                <Button size="small" type="primary" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEntry(t); }}>
                  录入结果
                </Button>
              )}
            </Space>
          </Card>
        )}
        locale={{ emptyText: <Empty description="暂无检测任务" /> }}
      />

      <Modal
        title={<Space><EditOutlined />录入结果 - {selectedTask?.testItem}</Space>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="draft" icon={<SaveOutlined />} onClick={saveDraft}>{draftSaved ? '草稿已保存' : '保存草稿'}</Button>,
          <Button key="submit" type="primary" icon={<SendOutlined />} onClick={submitResult}>提交结果</Button>,
        ]}
      >
        {selectedTask && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small" style={{ background: '#f6f8fa', borderRadius: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>样品：<Text strong>{selectedTask.sampleName}</Text></Text>
                <Text>检测项目：{selectedTask.testItem}</Text>
                <Text>方法：{selectedTask.method}</Text>
                {selectedTask.referenceRange && <Text>参考范围：{selectedTask.referenceRange}</Text>}
                {selectedTask.unit && <Text>单位：{selectedTask.unit}</Text>}
              </Space>
            </Card>

            <div>
              <Text strong>检测结果</Text>
              <Input
                size="large"
                placeholder="请输入检测数值"
                value={resultValue}
                onChange={e => setResultValue(e.target.value)}
                style={{ marginTop: 8 }}
                suffix={selectedTask.unit}
              />
              {selectedTask.referenceRange && (
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                  <ExclamationCircleOutlined /> 参考范围: {selectedTask.referenceRange}
                </Text>
              )}
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};
