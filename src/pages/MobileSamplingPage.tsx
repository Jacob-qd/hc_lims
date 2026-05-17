import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, List, Tag, Button, Typography, Space, Row, Col, message,
  Input, Select, Empty,
} from 'antd';
import {
  EnvironmentOutlined, CameraOutlined,
  CheckCircleOutlined, ClockCircleOutlined, RightOutlined,
  ArrowLeftOutlined, SaveOutlined, SyncOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface SamplingPoint {
  id: string; name: string;
  location: { latitude: number; longitude: number; address?: string };
  expectedSampleType: string; expectedCount: number;
}

interface SamplingTask {
  id: string; taskNo: string; projectName: string;
  sampleType: string; assignedTo: string; planDate: string;
  status: string; points: SamplingPoint[];
}

interface FieldPhoto {
  id: string; dataUrl: string; timestamp: string; note?: string;
}

interface DraftSample {
  taskId?: string; pointId?: string;
  name: string; sampleType: string;
  latitude: number; longitude: number; accuracy: number;
  photos: FieldPhoto[];
  fieldData: Record<string, string>;
  description: string;
}

type Page = 'list' | 'collect' | 'history';

/** 移动采样模块 */
export const MobileSamplingPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>('list');
  const [tasks, setTasks] = useState<SamplingTask[]>([]);
  const [fieldSamples, setFieldSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SamplingTask | null>(null);

  // 采样表单状态
  const [draft, setDraft] = useState<DraftSample>({
    name: '', sampleType: '地表水',
    latitude: 0, longitude: 0, accuracy: 0,
    photos: [], fieldData: {}, description: '',
  });
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'getting' | 'got'>('idle');
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // 加载采样任务
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/mobile/sampling-tasks');
      const json = await res.json();
      if (json.code === 200) setTasks(json.data.list || []);
    } catch { message.error('加载采样任务失败'); }
    finally { setLoading(false); }
  }, []);

  const loadFieldSamples = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/mobile/field-samples');
      const json = await res.json();
      if (json.code === 200) setFieldSamples(json.data.list || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadTasks(); loadFieldSamples(); }, [loadTasks, loadFieldSamples]);

  // GPS 定位
  const getGPS = () => {
    setGpsStatus('getting');
    if (!navigator.geolocation) {
      message.warning('浏览器不支持地理定位');
      setGpsStatus('idle');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraft(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }));
        setGpsStatus('got');
        message.success(`定位成功：${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        message.warning('定位失败：' + err.message);
        setGpsStatus('idle');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // 拍照
  const takePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const photo: FieldPhoto = {
          id: `photo-${Date.now()}`,
          dataUrl: ev.target?.result as string,
          timestamp: new Date().toISOString(),
        };
        setDraft(prev => ({ ...prev, photos: [...prev.photos, photo] }));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // 移除照片
  const removePhoto = (id: string) => {
    setDraft(prev => ({ ...prev, photos: prev.photos.filter(p => p.id !== id) }));
  };

  // 提交采样
  const submitSample = async () => {
    if (!draft.name.trim()) { message.warning('请输入样品名称'); return; }
    if (gpsStatus !== 'got') { message.warning('请先获取 GPS 位置'); return; }

    const payload = {
      ...draft,
      collectedBy: '当前用户',
      taskId: selectedTask?.id,
    };

    // 检查离线
    if (!navigator.onLine) {
      const queue = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
      queue.push({ ...payload, status: 'draft', offlineAt: new Date().toISOString() });
      localStorage.setItem('sampling_offline_queue', JSON.stringify(queue));
      setOfflineQueue(queue);
      message.success('采样记录已保存至离线队列，联网后自动同步');
      resetForm();
      return;
    }

    try {
      const res = await fetch('/api/v1/mobile/field-samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success(json.message || '采样记录已保存');
        // 自动创建 COC 链
        try {
          const cocRes = await fetch('/api/v1/coc/chains', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sampleId: json.data.sampleNo,
              sampleName: draft.name,
              status: 'active',
              events: [{
                eventType: 'SAMPLING',
                operatorName: '当前用户',
                occurredAt: new Date().toISOString(),
                location: `${draft.latitude.toFixed(4)}, ${draft.longitude.toFixed(4)}`,
              }],
            }),
          });
          const cocJson = await cocRes.json();
          if (cocJson.code === 200) {
            message.success('COC 监管链已自动创建');
          }
        } catch { /* COC creation failure is non-critical */ }
        resetForm();
        loadFieldSamples();
        setPage('history');
      }
    } catch {
      // 网络失败，加入离线队列
      const queue = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
      queue.push({ ...payload, status: 'draft', offlineAt: new Date().toISOString() });
      localStorage.setItem('sampling_offline_queue', JSON.stringify(queue));
      message.info('网络异常，采样记录已存入离线队列');
      resetForm();
    }
  };

  const resetForm = () => {
    setDraft({ name: '', sampleType: '地表水', latitude: 0, longitude: 0, accuracy: 0, photos: [], fieldData: {}, description: '' });
    setGpsStatus('idle');
  };

  // 同步离线队列
  const syncOffline = async () => {
    const queue = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
    if (queue.length === 0) { message.info('没有待同步的记录'); return; }
    let synced = 0;
    for (const item of queue) {
      try {
        const res = await fetch('/api/v1/mobile/field-samples', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        const json = await res.json();
        if (json.code === 200) synced++;
      } catch { break; }
    }
    if (synced > 0) {
      localStorage.setItem('sampling_offline_queue', JSON.stringify(queue.slice(synced)));
      message.success(`已同步 ${synced} 条记录`);
      loadFieldSamples();
    }
  };

  // 自动同步监听
  useEffect(() => {
    const handleOnline = () => {
      const queue = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
      if (queue.length > 0) syncOffline();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // ========== 渲染 ==========

  if (page === 'collect') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
        {/* 顶部栏 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => { setPage('list'); resetForm(); }} />
          <Title level={5} style={{ margin: 0, flex: 1 }}>现场采样</Title>
          <Button size="small" icon={<SaveOutlined />} onClick={submitSample} type="primary">提交</Button>
        </div>

        {/* GPS 定位 */}
        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <EnvironmentOutlined style={{ color: gpsStatus === 'got' ? '#52c41a' : '#1677ff', fontSize: 18 }} />
              <Text strong>GPS 定位</Text>
              {gpsStatus === 'got' ? (
                <Tag color="green">已定位</Tag>
              ) : gpsStatus === 'getting' ? (
                <Tag color="processing">定位中...</Tag>
              ) : (
                <Button size="small" type="link" onClick={getGPS}>获取位置</Button>
              )}
            </Space>
            {gpsStatus === 'got' && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {draft.latitude.toFixed(4)}, {draft.longitude.toFixed(4)} (精度: ±{draft.accuracy.toFixed(0)}m)
              </Text>
            )}
          </Space>
        </Card>

        {/* 照片 */}
        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }} title="现场照片">
          <Row gutter={[8, 8]}>
            {draft.photos.map(p => (
              <Col span={8} key={p.id}>
                <div style={{ position: 'relative' }}>
                  <img src={p.dataUrl} alt="现场" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} />
                  <Button
                    size="small" type="text" danger
                    style={{ position: 'absolute', top: -4, right: -4, fontSize: 14 }}
                    onClick={() => removePhoto(p.id)}
                  >×</Button>
                </div>
              </Col>
            ))}
            <Col span={8}>
              <div
                onClick={takePhoto}
                style={{
                  height: 80, borderRadius: 8, border: '2px dashed #d9d9d9',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', background: '#fafafa',
                }}
              >
                <CameraOutlined style={{ fontSize: 24, color: '#999' }} />
                <Text type="secondary" style={{ fontSize: 10 }}>拍照</Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 样品信息 */}
        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>样品名称</Text>
              <Input
                size="small" placeholder="如: 东湖入口-1" value={draft.name}
                onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>样品类型</Text>
              <Select
                size="small" style={{ width: '100%' }} value={draft.sampleType}
                onChange={v => setDraft(prev => ({ ...prev, sampleType: v }))}
                options={[
                  { value: '地表水', label: '地表水' },
                  { value: '地下水', label: '地下水' },
                  { value: '废水', label: '废水' },
                  { value: '土壤', label: '土壤' },
                  { value: '空气', label: '空气/废气' },
                  { value: '固体废物', label: '固体废物' },
                ]}
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>采样描述</Text>
              <TextArea
                rows={2} size="small" placeholder="采样位置描述、环境状况..."
                value={draft.description}
                onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </Space>
        </Card>

        {/* 现场测量 */}
        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }} title="现场测量数据">
          <Row gutter={[8, 8]}>
            {['pH', '水温(°C)', '溶解氧(mg/L)', '电导率(µS/cm)'].map(label => (
              <Col span={12} key={label}>
                <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
                <Input
                  size="small" placeholder="输入值"
                  value={draft.fieldData[label] || ''}
                  onChange={e => setDraft(prev => ({ ...prev, fieldData: { ...prev.fieldData, [label]: e.target.value } }))}
                />
              </Col>
            ))}
          </Row>
        </Card>

        {/* 提交按钮 */}
        <Button
          type="primary" block size="large"
          icon={<CheckCircleOutlined />}
          onClick={submitSample}
          style={{ borderRadius: 12, marginBottom: 12 }}
        >
          提交采样记录
        </Button>

        {/* 离线队列提示 */}
        {offlineQueue.length > 0 && (
          <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }} title={<Space><ClockCircleOutlined />离线队列</Space>}>
            <Text type="secondary">有 {offlineQueue.length} 条待同步记录</Text>
            <Button size="small" icon={<SyncOutlined />} onClick={syncOffline} style={{ marginLeft: 8 }}>立即同步</Button>
          </Card>
        )}
      </div>
    );
  }

  if (page === 'history') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setPage('list')} />
          <Title level={5} style={{ margin: 0, flex: 1 }}>已采样记录</Title>
          <Button size="small" icon={<SyncOutlined />} onClick={() => { syncOffline(); }}>同步</Button>
        </div>
        <List
          dataSource={fieldSamples}
          renderItem={(s: any) => (
            <Card size="small" style={{ marginBottom: 8, borderRadius: 12 }} key={s.id}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Tag color="blue">{s.sampleNo}</Tag>
                  <Text strong>{s.name}</Text>
                  <Tag color="green">已同步</Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  📍 {s.location?.latitude?.toFixed(4)}, {s.location?.longitude?.toFixed(4)} |
                  🕐 {new Date(s.collectedAt).toLocaleString('zh-CN')}
                </Text>
              </Space>
            </Card>
          )}
          locale={{ emptyText: <Empty description="暂无采样记录" /> }}
        />
      </div>
    );
  }

  // 默认：采样任务列表
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>移动采样</Title>
        <Space size="small">
          <Button size="small" onClick={() => setPage('history')}>📋 记录</Button>
          <Button size="small" type="primary" onClick={() => setPage('collect')}>➕ 直接采样</Button>
        </Space>
      </div>

      {/* 采样任务列表 */}
      <List
        dataSource={tasks}
        loading={loading}
        renderItem={(task: SamplingTask) => (
          <Card
            size="small" hoverable
            style={{ marginBottom: 12, borderRadius: 12 }}
            onClick={() => { setSelectedTask(task); setPage('collect'); }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between" align="middle">
                <Col><Text strong>{task.projectName}</Text></Col>
                <Col>
                  <Tag color={task.status === 'in_progress' ? 'blue' : 'default'}>
                    {task.status === 'in_progress' ? '进行中' : '待开始'}
                  </Tag>
                </Col>
              </Row>
              <Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  📍 {task.points?.length || 0} 个采样点 · {task.sampleType}
                </Text>
              </Space>
              {task.points?.slice(0, 2).map(p => (
                <div key={p.id} style={{ fontSize: 12, color: '#666', paddingLeft: 8 }}>
                  • {p.name} (预期 {p.expectedCount} 个)
                </div>
              ))}
              <Space>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  <ClockCircleOutlined /> {task.planDate} · {task.assignedTo}
                </Text>
                <RightOutlined style={{ color: '#999', fontSize: 12 }} />
              </Space>
            </Space>
          </Card>
        )}
        locale={{ emptyText: <Empty description="暂无采样任务" /> }}
      />

      {/* 离线队列提示 */}
      {(() => {
        const q = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
        if (q.length === 0) return null;
        return (
          <Card size="small" style={{ borderRadius: 12, marginTop: 8 }}>
            <Space>
              <ClockCircleOutlined style={{ color: '#faad14' }} />
              <Text type="secondary">{q.length} 条离线采样记录待同步</Text>
              <Button size="small" icon={<SyncOutlined />} onClick={syncOffline}>同步</Button>
            </Space>
          </Card>
        );
      })()}
    </div>
  );
};
