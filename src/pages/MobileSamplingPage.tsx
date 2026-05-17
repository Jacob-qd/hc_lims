import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, List, Tag, Button, Typography, Space, Row, Col, message,
  Input, Select, Empty, Modal, InputNumber, Divider,
} from 'antd';
import {
  EnvironmentOutlined, CameraOutlined, ScanOutlined, QrcodeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, RightOutlined,
  ArrowLeftOutlined, SaveOutlined, SyncOutlined, CopyOutlined,
  AimOutlined, GlobalOutlined, InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;
const { TextArea } = Input;

// ===== Types =====
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
interface FieldPhoto { id: string; dataUrl: string; timestamp: string; note?: string; }
interface FieldMeasurement {
  [key: string]: string | undefined;
  pH?: string; '水温(°C)'?: string; '溶解氧(mg/L)'?: string; '电导率(µS/cm)'?: string;
}
interface DraftSample {
  taskId?: string; pointId?: string; batchIndex?: number;
  name: string; sampleType: string;
  latitude: number; longitude: number; accuracy: number;
  photos: FieldPhoto[];
  fieldData: FieldMeasurement;
  description: string;
  containerBarcode?: string;
}
interface ContainerTemplate {
  id: string; label: string; type: string; volume: string; barcode: string;
}

type Page = 'list' | 'task-detail' | 'collect' | 'history';

const containerTemplates: ContainerTemplate[] = [
  { id: 'ct1', label: '棕色玻璃瓶-500mL', type: '玻璃', volume: '500mL', barcode: 'CN-001' },
  { id: 'ct2', label: '白色塑料瓶-1L', type: '塑料', volume: '1L', barcode: 'CN-002' },
  { id: 'ct3', label: '无菌袋-250mL', type: '无菌袋', volume: '250mL', barcode: 'CN-003' },
  { id: 'ct4', label: '顶空瓶-40mL', type: '玻璃', volume: '40mL', barcode: 'CN-004' },
];

/** 移动采样模块 — 集成 Phase 1-6 */
export const MobileSamplingPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>('list');
  const [tasks, setTasks] = useState<SamplingTask[]>([]);
  const [fieldSamples, setFieldSamples] = useState<LooseAny[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SamplingTask | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<SamplingPoint | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<LooseAny[]>([]);

  // === Phase 3: 批量采样 ===
  const [batchMode, setBatchMode] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [batchSamples, setBatchSamples] = useState<DraftSample[]>([]);
  const [batchStep, setBatchStep] = useState<'config' | 'collect' | 'review'>('config');

  // === Phase 6: 容器条码 ===
  const [containerModal, setContainerModal] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<ContainerTemplate | null>(null);

  // 采样表单状态
  const [draft, setDraft] = useState<DraftSample>({
    name: '', sampleType: '地表水',
    latitude: 0, longitude: 0, accuracy: 0,
    photos: [], fieldData: {}, description: '',
  });
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'getting' | 'got'>('idle');

  // ===== 数据加载 =====
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadTasks(); loadFieldSamples(); }, [loadTasks, loadFieldSamples]);

  // ===== GPS 定位 (Phase 4) =====
  const getGPS = (cb?: (lat: number, lng: number) => void) => {
    setGpsStatus('getting');
    if (!navigator.geolocation) {
      message.warning('浏览器不支持地理定位');
      setGpsStatus('idle');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setDraft(prev => ({ ...prev, latitude, longitude, accuracy }));
        setGpsStatus('got');
        message.success(`定位成功：${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        cb?.(latitude, longitude);
      },
      (err) => { message.warning('定位失败：' + err.message); setGpsStatus('idle'); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // ===== 拍照 =====
  const takePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
    input.onchange = (e: LooseAny) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => setDraft(prev => ({
        ...prev,
        photos: [...prev.photos, { id: `photo-${Date.now()}`, dataUrl: ev.target?.result as string, timestamp: new Date().toISOString() }],
      }));
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ===== 提交采样 =====
  const submitSample = async (sampleData: DraftSample) => {
    if (!sampleData.name.trim()) { message.warning('请输入样品名称'); return false; }
    if (gpsStatus !== 'got') { message.warning('请先获取 GPS 位置'); return false; }

    const payload = {
      ...sampleData, collectedBy: '当前用户', taskId: selectedTask?.id,
    };

    if (!navigator.onLine) {
      const queue = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
      queue.push({ ...payload, status: 'draft', offlineAt: new Date().toISOString() });
      localStorage.setItem('sampling_offline_queue', JSON.stringify(queue));
      setOfflineQueue(queue);
      message.success('已存入离线队列');
      return true;
    }

    try {
      const res = await fetch('/api/v1/mobile/field-samples', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success(`✅ ${sampleData.name} 已保存`);
        // 自动创建 COC 链
        try {
          await fetch('/api/v1/coc/chains', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sampleId: json.data.sampleNo, sampleName: sampleData.name, status: 'active',
              events: [{ eventType: 'SAMPLING', operatorName: '当前用户', occurredAt: new Date().toISOString(), location: `${sampleData.latitude.toFixed(4)}, ${sampleData.longitude.toFixed(4)}` }],
            }),
          });
        } catch { /* non-critical */ }
        return true;
      }
    } catch {
      const queue = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
      queue.push({ ...payload, status: 'draft', offlineAt: new Date().toISOString() });
      localStorage.setItem('sampling_offline_queue', JSON.stringify(queue));
      message.info('已存入离线队列');
      return true;
    }
    return false;
  };

  const resetForm = () => {
    setDraft({ name: '', sampleType: '地表水', latitude: 0, longitude: 0, accuracy: 0, photos: [], fieldData: {}, description: '' });
    setGpsStatus('idle');
  };

  // ===== 离线同步 =====
  const syncOffline = async () => {
    const queue = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
    if (queue.length === 0) { message.info('没有待同步的记录'); return; }
    let synced = 0;
    for (const item of queue) {
      try {
        const res = await fetch('/api/v1/mobile/field-samples', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item),
        });
        if ((await res.json()).code === 200) synced++;
      } catch { break; }
    }
    if (synced > 0) {
      localStorage.setItem('sampling_offline_queue', JSON.stringify(queue.slice(synced)));
      message.success(`已同步 ${synced} 条`);
      loadFieldSamples();
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      const q = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
      if (q.length > 0) syncOffline();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // ===== Phase 5: 批量采样逻辑 =====
  const startBatch = () => {
    if (batchCount < 1) { message.warning('至少采集 1 个样品'); return; }
    if (gpsStatus !== 'got') { message.warning('请先获取 GPS 位置'); return; }
    const samples: DraftSample[] = [];
    for (let i = 0; i < batchCount; i++) {
      samples.push({
        ...draft,
        name: `${draft.name || selectedPoint?.name || '样品'}-${i + 1}`,
        batchIndex: i,
      });
    }
    setBatchSamples(samples);
    setBatchStep('review');
  };

  const submitBatch = async () => {
    let success = 0;
    for (const s of batchSamples) {
      if (await submitSample(s)) success++;
    }
    if (success > 0) {
      resetForm();
      setBatchMode(false);
      setBatchStep('config');
      loadFieldSamples();
      setPage('history');
    }
  };

  const removeBatchSample = (idx: number) => {
    setBatchSamples(prev => prev.filter((_, i) => i !== idx));
  };

  // ===== Phase 6: 容器条码 =====
  const handleBarcodeScan = (code: string) => {
    setScannedBarcode(code);
    const match = containerTemplates.find(c => c.barcode === code || c.label.includes(code));
    if (match) {
      setSelectedContainer(match);
      setDraft(prev => ({ ...prev, containerBarcode: match.barcode }));
      message.success(`已识别容器：${match.label}`);
    } else {
      setDraft(prev => ({ ...prev, containerBarcode: code }));
      message.info(`已记录条码：${code}`);
    }
    setContainerModal(false);
  };

  // ===== Phase 4: 地图导航 =====
  const openMap = (lat: number, lng: number) => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isIOS) {
      window.open(`https://maps.apple.com/?ll=${lat},${lng}&q=${lat},${lng}`);
    } else if (isAndroid) {
      window.open(`https://ditu.amap.com/search?query=${lat},${lng}`);
    } else {
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`);
    }
  };

  // ===== 渲染: 采样表单（复用 /collect） =====
  const renderCollectForm = (showSubmit = true) => (
    <>
      {/* Phase 4: GPS + 地图导航 */}
      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <EnvironmentOutlined style={{ color: gpsStatus === 'got' ? '#52c41a' : '#1677ff', fontSize: 18 }} />
                <Text strong>GPS 定位</Text>
                {gpsStatus === 'got' ? <Tag color="green">已定位</Tag> : gpsStatus === 'getting' ? <Tag color="processing">定位中...</Tag> : null}
              </Space>
            </Col>
            <Col>
              {gpsStatus === 'got' ? (
                <Button size="small" icon={<RefreshCwIcon />} onClick={() => getGPS()}>刷新</Button>
              ) : (
                <Button size="small" type="primary" icon={<AimOutlined />} onClick={() => getGPS()}>定位</Button>
              )}
            </Col>
          </Row>
          {gpsStatus === 'got' && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {draft.latitude.toFixed(4)}, {draft.longitude.toFixed(4)} (±{draft.accuracy.toFixed(0)}m)
              </Text>
              <Space style={{ marginTop: 4 }}>
                <Button size="small" type="link" icon={<GlobalOutlined />} onClick={() => openMap(draft.latitude, draft.longitude)}>
                  查看地图
                </Button>
                <Button size="small" type="link" icon={<CopyOutlined />} onClick={() => {
                  navigator.clipboard?.writeText(`${draft.latitude},${draft.longitude}`);
                  message.success('坐标已复制');
                }}>
                  复制坐标
                </Button>
              </Space>
            </div>
          )}
        </Space>
      </Card>

      {/* 照片 */}
      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }} title="现场照片">
        <Row gutter={[8, 8]}>
          {draft.photos.map(p => (
            <Col span={8} key={p.id}>
              <div style={{ position: 'relative' }}>
                <img src={p.dataUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} />
                <Button size="small" type="text" danger style={{ position: 'absolute', top: -4, right: -4, fontSize: 14 }} onClick={() => setDraft(prev => ({ ...prev, photos: prev.photos.filter(x => x.id !== p.id) }))}>×</Button>
              </div>
            </Col>
          ))}
          <Col span={8}>
            <div onClick={takePhoto} style={{ height: 80, borderRadius: 8, border: '2px dashed #d9d9d9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa' }}>
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
            <Input size="small" placeholder="如: 东湖入口-1" value={draft.name}
              onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>样品类型</Text>
            <Select size="small" style={{ width: '100%' }} value={draft.sampleType}
              onChange={v => setDraft(prev => ({ ...prev, sampleType: v }))}
              options={[
                { value: '地表水', label: '地表水' }, { value: '地下水', label: '地下水' },
                { value: '废水', label: '废水' }, { value: '土壤', label: '土壤' },
                { value: '空气', label: '空气/废气' }, { value: '固体废物', label: '固体废物' },
              ]} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>采样描述</Text>
            <TextArea rows={2} size="small" placeholder="采样位置描述、环境状况..." value={draft.description}
              onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))} />
          </div>
        </Space>
      </Card>

      {/* Phase 6: 容器条码 */}
      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }} title="样品容器">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={8} align="middle">
            <Col flex="auto">
              <Input size="small" placeholder="扫描或输入容器条码" value={scannedBarcode}
                onChange={e => setScannedBarcode(e.target.value)}
                onPressEnter={() => handleBarcodeScan(scannedBarcode)}
                prefix={<ScanOutlined style={{ color: '#999' }} />} />
            </Col>
            <Col>
              <Button size="small" icon={<QrcodeOutlined />} onClick={() => setContainerModal(true)}>选择</Button>
            </Col>
          </Row>
          {selectedContainer && (
            <Tag color="blue" closable onClose={() => { setSelectedContainer(null); setDraft(prev => ({ ...prev, containerBarcode: undefined })); }}>
              {selectedContainer.label} ({selectedContainer.volume})
            </Tag>
          )}
        </Space>
      </Card>

      {/* 现场测量 */}
      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }} title="现场测量数据">
        <Row gutter={[8, 8]}>
          {['pH', '水温(°C)', '溶解氧(mg/L)', '电导率(µS/cm)'].map(label => (
            <Col span={12} key={label}>
              <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
              <Input size="small" placeholder="输入值" value={draft.fieldData[label] || ''}
                onChange={e => setDraft(prev => ({ ...prev, fieldData: { ...prev.fieldData, [label]: e.target.value } }))} />
            </Col>
          ))}
        </Row>
      </Card>

      {showSubmit && (
        <>
          {/* Phase 5: 批量采样 */}
          <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
            <Row justify="space-between" align="middle">
              <Col><Text>批量采样</Text></Col>
              <Col>
                <Space>
                  <InputNumber size="small" min={1} max={20} value={batchCount} onChange={v => setBatchCount(v || 1)} style={{ width: 60 }} />
                  <Text type="secondary">个</Text>
                  <Button size="small" icon={<CopyOutlined />} onClick={startBatch}>批量提交</Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Button type="primary" block size="large" icon={<CheckCircleOutlined />}
            onClick={async () => { if (await submitSample(draft)) { resetForm(); loadFieldSamples(); setPage('history'); } }}
            style={{ borderRadius: 12, marginBottom: 12 }}>
            提交采样记录
          </Button>
        </>
      )}

      {/* 离线队列 */}
      {offlineQueue.length > 0 && (
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }} title={<Space><ClockCircleOutlined />离线队列</Space>}>
          <Text type="secondary">{offlineQueue.length} 条待同步</Text>
          <Button size="small" icon={<SyncOutlined />} onClick={syncOffline} style={{ marginLeft: 8 }}>同步</Button>
        </Card>
      )}
    </>
  );

  // ===== 页面渲染 =====

  // === 批量采样审核页 (Phase 5) ===
  if (batchMode && batchStep === 'review') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setBatchStep('config')} />
          <Title level={5} style={{ margin: 0, flex: 1 }}>批量采样确认</Title>
          <Button size="small" type="primary" icon={<SaveOutlined />} onClick={submitBatch}>全部提交</Button>
        </div>
        <List
          dataSource={batchSamples}
          renderItem={(s, idx) => (
            <Card size="small" style={{ marginBottom: 8, borderRadius: 12 }} key={idx}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Tag color="blue">{idx + 1}</Tag>
                    <Text strong>{s.name}</Text>
                  </Space>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                    {s.sampleType} · 📍 {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                  </div>
                </Col>
                <Col>
                  <Button size="small" type="text" danger onClick={() => removeBatchSample(idx)}>移除</Button>
                </Col>
              </Row>
            </Card>
          )}
        />
      </div>
    );
  }

  // === 采样表单页 ===
  if (page === 'collect') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => { setPage(selectedTask ? 'task-detail' : 'list'); resetForm(); }} />
          <Title level={5} style={{ margin: 0, flex: 1 }}>{selectedPoint ? selectedPoint.name : '现场采样'}</Title>
          {selectedPoint && <Tag color="blue">{selectedPoint.expectedSampleType}</Tag>}
        </div>
        {renderCollectForm()}
      </div>
    );
  }

  // === 历史记录页 ===
  if (page === 'history') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setPage('list')} />
          <Title level={5} style={{ margin: 0, flex: 1 }}>已采样记录</Title>
          <Button size="small" icon={<SyncOutlined />} onClick={syncOffline}>同步</Button>
        </div>
        <List
          dataSource={fieldSamples}
          renderItem={(s: LooseAny) => (
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
                {s.containerBarcode && <Text type="secondary" style={{ fontSize: 11 }}>容器: {s.containerBarcode}</Text>}
              </Space>
            </Card>
          )}
          locale={{ emptyText: <Empty description="暂无采样记录" /> }}
        />
      </div>
    );
  }

  // === Phase 3: 采样任务详情页 ===
  if (page === 'task-detail' && selectedTask) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setPage('list')} />
          <Title level={5} style={{ margin: 0, flex: 1 }}>{selectedTask.projectName}</Title>
          <Button size="small" type="primary" onClick={() => { setSelectedPoint(null); resetForm(); getGPS(() => setPage('collect')); }}>直接采样</Button>
        </div>

        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row justify="space-between"><Col><Text type="secondary">任务编号</Text></Col><Col><Text>{selectedTask.taskNo}</Text></Col></Row>
            <Row justify="space-between"><Col><Text type="secondary">样品类型</Text></Col><Col><Tag>{selectedTask.sampleType}</Tag></Col></Row>
            <Row justify="space-between"><Col><Text type="secondary">计划日期</Text></Col><Col><Text>{selectedTask.planDate}</Text></Col></Row>
            <Row justify="space-between"><Col><Text type="secondary">采样员</Text></Col><Col><Text>{selectedTask.assignedTo}</Text></Col></Row>
          </Space>
        </Card>

        <Text strong style={{ display: 'block', marginBottom: 8 }}>采样点（{selectedTask.points.length} 个）</Text>
        <List
          dataSource={selectedTask.points}
          renderItem={(point: SamplingPoint) => (
            <Card
              size="small" hoverable style={{ marginBottom: 8, borderRadius: 12 }}
              onClick={() => {
                setSelectedPoint(point);
                setDraft(prev => ({
                  ...prev,
                  name: `${point.name}-1`,
                  sampleType: point.expectedSampleType,
                  latitude: point.location.latitude,
                  longitude: point.location.longitude,
                }));
                setGpsStatus('got');
                setPage('collect');
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <EnvironmentOutlined style={{ color: '#1677ff' }} />
                    <Text strong>{point.name}</Text>
                  </Space>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                    📍 {point.location.latitude.toFixed(4)}, {point.location.longitude.toFixed(4)}
                    {point.location.address && ` · ${point.location.address}`}
                  </div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                    预期 {point.expectedCount} 个 · {point.expectedSampleType}
                  </div>
                </Col>
                <Col>
                  <Space>
                    <Button size="small" type="link" icon={<GlobalOutlined />} onClick={(e) => { e.stopPropagation(); openMap(point.location.latitude, point.location.longitude); }}>
                      导航
                    </Button>
                    <RightOutlined style={{ color: '#999' }} />
                  </Space>
                </Col>
              </Row>
            </Card>
          )}
        />
      </div>
    );
  }

  // === 默认：采样任务列表页 ===
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>移动采样</Title>
        <Space size="small">
          <Button size="small" onClick={() => setPage('history')}>📋 记录</Button>
          <Button size="small" type="primary" onClick={() => { setSelectedTask(null); setSelectedPoint(null); resetForm(); setPage('collect'); }}>
            ➕ 直接采样
          </Button>
        </Space>
      </div>

      <List
        dataSource={tasks}
        loading={loading}
        renderItem={(task: SamplingTask) => (
          <Card
            size="small" hoverable style={{ marginBottom: 12, borderRadius: 12 }}
            onClick={() => { setSelectedTask(task); setPage('task-detail'); }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between" align="middle">
                <Col><Text strong>{task.projectName}</Text></Col>
                <Col><Tag color={task.status === 'in_progress' ? 'blue' : 'default'}>
                  {task.status === 'in_progress' ? '进行中' : '待开始'}
                </Tag></Col>
              </Row>
              <Text type="secondary" style={{ fontSize: 12 }}>
                📍 {task.points?.length || 0} 个采样点 · {task.sampleType}
              </Text>
              {task.points?.slice(0, 2).map(p => (
                <div key={p.id} style={{ fontSize: 12, color: '#666', paddingLeft: 8 }}>
                  • {p.name} ({p.location.latitude.toFixed(2)}, {p.location.longitude.toFixed(2)}) · {p.expectedCount}个
                </div>
              ))}
              <Text type="secondary" style={{ fontSize: 11 }}>
                <ClockCircleOutlined /> {task.planDate} · {task.assignedTo}
                <RightOutlined style={{ marginLeft: 8, color: '#999', fontSize: 12 }} />
              </Text>
            </Space>
          </Card>
        )}
        locale={{ emptyText: <Empty description="暂无采样任务" /> }}
      />

      {/* 离线队列 */}
      {(() => {
        const q = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
        if (q.length === 0) return null;
        return (
          <Card size="small" style={{ borderRadius: 12, marginTop: 8 }}>
            <Space>
              <ClockCircleOutlined style={{ color: '#faad14' }} />
              <Text type="secondary">{q.length} 条离线待同步</Text>
              <Button size="small" icon={<SyncOutlined />} onClick={syncOffline}>同步</Button>
            </Space>
          </Card>
        );
      })()}

      {/* Phase 6: 容器选择 Modal */}
      <Modal title="选择样品容器" open={containerModal} onCancel={() => setContainerModal(false)} footer={null}>
        <Input.Search
          placeholder="扫描或搜索容器条码"
          enterButton="识别"
          value={scannedBarcode}
          onChange={e => setScannedBarcode(e.target.value)}
          onSearch={handleBarcodeScan}
          style={{ marginBottom: 16 }}
        />
        <Divider>常用容器</Divider>
        <List
          dataSource={containerTemplates}
          renderItem={(c: ContainerTemplate) => (
            <List.Item
              onClick={() => handleBarcodeScan(c.barcode)}
              style={{ cursor: 'pointer', padding: '8px 0' }}
            >
              <List.Item.Meta
                avatar={<InboxOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                title={c.label}
                description={`${c.type} · ${c.volume} · 条码: ${c.barcode}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

// Helper: refresh icon (inline SVG since RefreshCw may not be in the icon set)
const RefreshCwIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
