import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, DatePicker, Row, Col,
  Space, Typography, Drawer, Timeline, Badge, Steps, Form,
  Modal, message, Radio, Checkbox, Divider, Tooltip, Tabs,
  Collapse, Descriptions, List, Empty, InputNumber, Upload,
  Alert, Progress, Result,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, PrinterOutlined, ExportOutlined,
  DeleteOutlined, FileTextOutlined, EditOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SendOutlined,
  HistoryOutlined, PaperClipOutlined, CommentOutlined,
  SafetyCertificateOutlined, UserOutlined, ClockCircleOutlined,
  ArrowRightOutlined, DownloadOutlined, CloudUploadOutlined,
  InboxOutlined, ExclamationCircleOutlined, AuditOutlined,
  SignatureOutlined, RollbackOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type {
  Report, ReportTestResult, ReportSignature, ReportReview,
  ReportAnnotation, ReviewChecklistItem, ReportChangeEntry,
  ReportAttachment, ReportCover, ReportAnnotationReply,
} from '../mocks/data';
import {
  reportStatuses, reviewChecklistDef, mockUsers,
  customers, projects, sampleTypes,
} from '../mocks/data';
import type { Dayjs } from 'dayjs';
import { computeDocumentHash, mockSm3Hash, signatureMeanings } from '../mocks/data';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

// ================================================
// Helper Functions
// ================================================

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    'draft': 'default', 'pending_tech_review': 'blue',
    'tech_review': 'processing', 'pending_approval': 'purple',
    'approval': 'processing', 'issued': 'success', 'archived': 'default',
  };
  return map[status] || 'default';
};

const getRoleColor = (role: string) => {
  const map: Record<string, string> = { compiler: 'blue', reviewer: 'orange', approver: 'green' };
  return map[role] || 'default';
};

const flowStepStatus = (report: Report): Record<string, 'process' | 'finish' | 'wait'> => {
  const sigRoles = report.signatures.map(s => s.role);
  return {
    compiler: sigRoles.includes('compiler') ? 'finish' : (report.status === 'draft' ? 'process' : 'wait'),
    reviewer: sigRoles.includes('reviewer') ? 'finish' : (sigRoles.includes('compiler') ? 'process' : 'wait'),
    approver: sigRoles.includes('approver') ? 'finish' : (sigRoles.includes('reviewer') ? 'process' : 'wait'),
  };
};

// ================================================
// Sub-Components
// ================================================

/** Enhanced Digital Signature Modal with SM2/SM3 */
const SignatureModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSign: (data: { password: string; reason: string; role: string; meaning: string; meaningStatement: string }) => void;
  role: 'compiler' | 'reviewer' | 'approver';
  roleLabel: string;
  reportId?: string;
}> = ({ open, onClose, onSign, role, roleLabel, reportId }) => {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [sm3Hash, setSm3Hash] = useState('');

  // Map role to meaning
  const roleToMeaning: Record<string, string> = {
    compiler: 'PREPARED',
    reviewer: 'REVIEWED',
    approver: 'APPROVED',
  };
  const currentMeaning = roleToMeaning[role] || 'PREPARED';
  const meaningDef = signatureMeanings.find(m => m.value === currentMeaning);

  useEffect(() => {
    if (open && reportId) {
      // Generate a mock SM3 hash for the document
      const docForHash = { id: reportId, reportNo: 'RPT...', title: '检测报告', customerName: '', testResults: [] };
      const hash = computeDocumentHash(docForHash);
      setSm3Hash(hash);
      setPassword('');
      setReason('');
      setConfirmed(false);
    }
  }, [open, reportId]);

  const handleSubmit = () => {
    if (!password) { message.warning('请输入签名密码'); return; }
    if (!reason) { message.warning('请输入签名理由'); return; }
    if (!confirmed) { message.warning('请确认签名内容真实有效'); return; }
    if (password !== '123456') { message.error('密码错误'); return; }
    onSign({ password, reason, role, meaning: currentMeaning, meaningStatement: reason });
    setPassword('');
    setReason('');
    setConfirmed(false);
  };

  return (
    <Modal
      title={<span><SignatureOutlined style={{ color: '#1677ff' }} /> 电子签名确认</span>}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="确认签名"
      okButtonProps={{ icon: <CheckCircleOutlined />, disabled: !confirmed || !password || !reason }}
      width={560}
    >
      <Alert
        message={{
          PREPARED: '报告编制完成，将以「编制」身份进行电子签名',
          REVIEWED: '技术审核通过，将以「审核」身份进行电子签名',
          APPROVED: '报告批准签发，将以「批准」身份进行电子签名',
        }[currentMeaning] || `即将以「${roleLabel}」身份进行电子签名`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card size="small" style={{ marginBottom: 16, background: '#f6f8fa' }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="签名含义">
            <Tag color={role === 'compiler' ? 'blue' : role === 'reviewer' ? 'orange' : 'green'}>
              {meaningDef?.label || roleLabel}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>{meaningDef?.description}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="签名算法">
            <Tag color="geekblue">SM2</Tag> 椭圆曲线公钥密码算法 (GB/T 32918)
          </Descriptions.Item>
          <Descriptions.Item label="摘要算法">
            <Tag color="geekblue">SM3</Tag> 密码杂凑算法 (GB/T 32905)
          </Descriptions.Item>
          <Descriptions.Item label="文档摘要 (SM3)">
            <Text copyable style={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>
              {sm3Hash}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Form layout="vertical">
        <Form.Item label="签名密码" required>
          <Input.Password
            placeholder="请输入签名密码（测试密码：123456）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            prefix={<SafetyCertificateOutlined />}
          />
        </Form.Item>
        <Form.Item label="签名含义声明" required>
          <TextArea
            placeholder={meaningDef?.description || '请说明签名理由...'}
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox checked={confirmed} onChange={e => setConfirmed(e.target.checked)}>
            <Text strong>我确认以上内容真实有效，并承担相应法律责任</Text>
          </Checkbox>
        </Form.Item>
      </Form>

      <div style={{ fontSize: 12, color: '#999', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
        <ClockCircleOutlined style={{ marginRight: 4 }} />
        签名后将记录时间戳 (NTP)、IP 地址、会话ID，形成不可篡改的签名审计链
      </div>
    </Modal>
  );
};

/** Review Approval Modal */
const ReviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { conclusion: string; opinion: string; checklist: ReviewChecklistItem[] }) => void;
  report: Report | null;
}> = ({ open, onClose, onSubmit, report }) => {
  const [conclusion, setConclusion] = useState<string>('pass');
  const [opinion, setOpinion] = useState('');
  const [checklist, setChecklist] = useState<ReviewChecklistItem[]>(
    reviewChecklistDef.map(c => ({ ...c }))
  );

  useEffect(() => {
    if (open) {
      setConclusion('pass');
      setOpinion('');
      setChecklist(reviewChecklistDef.map(c => ({ ...c })));
    }
  }, [open]);

  const handleSubmit = () => {
    const unchecked = checklist.filter(c => !c.passed);
    if (unchecked.length > 0) {
      message.warning(`尚有 ${unchecked.length} 项审核要点未通过`);
      return;
    }
    if (!opinion.trim()) { message.warning('请输入审核意见'); return; }
    onSubmit({ conclusion, opinion, checklist });
    onClose();
  };

  return (
    <Modal
      title={<span><AuditOutlined /> 审核确认</span>}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      width={640}
      okText="确认审核"
      okButtonProps={{ icon: <CheckCircleOutlined /> }}
    >
      {report && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>{report.reportNo}</Text> - <Text>{report.title}</Text>
        </div>
      )}
      <Divider>审核要点检查清单</Divider>
      <List
        dataSource={checklist}
        renderItem={(item, index) => (
          <List.Item>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <Checkbox
                checked={item.passed}
                onChange={e => {
                  const next = [...checklist];
                  next[index] = { ...next[index], passed: e.target.checked };
                  setChecklist(next);
                }}
              />
              <Text delete={item.passed} style={{ textDecoration: item.passed ? 'line-through' : 'none', flex: 1 }}>
                {index + 1}. {item.label}
              </Text>
            </div>
          </List.Item>
        )}
      />
      <Divider>审核结论</Divider>
      <Radio.Group value={conclusion} onChange={e => setConclusion(e.target.value)} style={{ marginBottom: 16 }}>
        <Radio.Button value="pass" style={{ borderColor: '#52c41a', color: conclusion === 'pass' ? '#52c41a' : undefined }}>
          <CheckCircleOutlined /> 通过
        </Radio.Button>
        <Radio.Button value="fail" style={{ borderColor: '#f5222d', color: conclusion === 'fail' ? '#f5222d' : undefined }}>
          <CloseCircleOutlined /> 不通过
        </Radio.Button>
      </Radio.Group>
      <Form.Item label="审核意见" required>
        <TextArea
          placeholder="请输入审核意见..."
          rows={4}
          value={opinion}
          onChange={e => setOpinion(e.target.value)}
        />
      </Form.Item>
    </Modal>
  );
};

/** Annotations Panel (批注功能) */
const AnnotationsPanel: React.FC<{
  annotations: ReportAnnotation[];
  reportId: string;
  onAdd: (content: string, mentions: string[]) => void;
  onResolve: (annId: string) => void;
  onReply: (annId: string, content: string) => void;
}> = ({ annotations, reportId, onAdd, onResolve, onReply }) => {
  const [newContent, setNewContent] = useState('');
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});

  const handleAdd = () => {
    if (!newContent.trim()) { message.warning('请输入批注内容'); return; }
    // Extract @mentions
    const mentionMatches = newContent.match(/@(\S+)/g) || [];
    const mentions = mentionMatches.map(m => m.slice(1));
    onAdd(newContent, mentions);
    setNewContent('');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <TextArea
          placeholder="添加批注，使用 @用户名 提及相关人员..."
          rows={3}
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
        />
        <Button
          type="primary"
          size="small"
          icon={<CommentOutlined />}
          onClick={handleAdd}
          style={{ marginTop: 8 }}
        >
          添加批注
        </Button>
      </div>

      {annotations.length === 0 ? (
        <Empty description="暂无批注" />
      ) : (
        <List
          dataSource={annotations}
          renderItem={(ann) => (
            <List.Item
              actions={
                ann.status === 'open'
                  ? [
                      <Button
                        key="resolve"
                        type="link"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => onResolve(ann.id)}
                      >
                        解决
                      </Button>,
                    ]
                  : [<Tag key="done" color="success">已解决</Tag>]
              }
            >
              <List.Item.Meta
                avatar={<Badge status={ann.status === 'open' ? 'warning' : 'success'} />}
                title={
                  <Space>
                    <Text strong>{ann.authorName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{ann.createdAt}</Text>
                    {ann.mentions.length > 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        @{ann.mentions.join(', ')}
                      </Text>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Text>{ann.content}</Text>
                    {ann.replies.length > 0 && (
                      <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px solid #e8e8e8' }}>
                        {ann.replies.map(reply => (
                          <div key={reply.id} style={{ marginBottom: 4 }}>
                            <Text strong style={{ fontSize: 12 }}>{reply.authorName}</Text>
                            <Text style={{ fontSize: 12, marginLeft: 8 }}>{reply.content}</Text>
                            <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>{reply.createdAt}</Text>
                          </div>
                        ))}
                      </div>
                    )}
                    {ann.status === 'open' && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <Input
                          size="small"
                          placeholder="回复..."
                          style={{ flex: 1 }}
                          value={replyContents[ann.id] || ''}
                          onChange={e => setReplyContents({ ...replyContents, [ann.id]: e.target.value })}
                        />
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => {
                            const content = replyContents[ann.id];
                            if (!content?.trim()) { message.warning('请输入回复内容'); return; }
                            onReply(ann.id, content);
                            setReplyContents({ ...replyContents, [ann.id]: '' });
                          }}
                        >
                          回复
                        </Button>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

/** Change History Panel */
const ChangeHistoryPanel: React.FC<{ history: ReportChangeEntry[] }> = ({ history }) => {
  if (history.length === 0) {
    return <Empty description="暂无变更记录" />;
  }
  return (
    <Timeline
      items={history.map(h => ({
        color: 'blue',
        children: (
          <div>
            <Text strong>{h.field}</Text>
            <div style={{ fontSize: 12, color: '#999' }}>{h.operator} · {h.changedAt}</div>
            <div style={{ fontSize: 12 }}>
              <Text type="secondary">变更：</Text>
              <Text delete style={{ fontSize: 12 }}>{h.oldValue}</Text>
              <ArrowRightOutlined style={{ margin: '0 8px', fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{h.newValue}</Text>
            </div>
          </div>
        ),
      }))}
    />
  );
};

/** Simple QR Code Display (mock) */
const QRCodeDisplay: React.FC<{ value: string; size?: number }> = ({ value, size = 150 }) => {
  // Generate a deterministic pattern from the value
  const cells = 19; // QR code grid
  const cellSize = Math.floor(size / cells);
  const actualSize = cellSize * cells;

  // Deterministic pseudo-random based on value
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = ((seed << 5) - seed) + value.charCodeAt(i);
    seed |= 0;
  }

  const getBit = (x: number, y: number): boolean => {
    const idx = (x * 7 + y * 13 + seed) % 100;
    const hash = (seed * (idx + 1) * 31) % 100;
    // Fixed patterns for QR corner markers
    if ((x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7)) {
      const cx = x < 7 ? x : (x >= cells - 7 ? x - (cells - 7) : x);
      const cy = y < 7 ? y : (y >= cells - 7 ? y - (cells - 7) : y);
      if ((cx === 0 || cx === 6) && (cy >= 0 && cy <= 6)) return true;
      if ((cy === 0 || cy === 6) && (cx >= 0 && cx <= 6)) return true;
      if (cx >= 2 && cx <= 4 && cy >= 2 && cy <= 4) return true;
      return false;
    }
    return hash > 45;
  };

  return (
    <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <svg width={actualSize} height={actualSize}>
        {Array.from({ length: cells }).map((_, y) =>
          Array.from({ length: cells }).map((_, x) =>
            getBit(x, y) ? (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#000"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};

/** Flow Step Indicator */
const FlowStepIndicator: React.FC<{ report: Report }> = ({ report }) => {
  const steps = [
    { title: '报告编制', role: 'compiler', label: '编制人' },
    { title: '技术审核', role: 'reviewer', label: '审核人' },
    { title: '批准签发', role: 'approver', label: '批准人' },
  ];

  const sigMap = new Map(report.signatures.map(s => [s.role, s]));

  const stepStatus = (role: string): 'finish' | 'process' | 'wait' | 'error' => {
    const sig = sigMap.get(role);
    if (sig) return 'finish';
    // Determine which step should be current
    const idx = steps.findIndex(s => s.role === role);
    const prevDone = idx === 0 || sigMap.has(steps[idx - 1].role);
    if (prevDone) return 'process';
    return 'wait';
  };

  return (
    <Steps
      direction="vertical"
      size="small"
      current={steps.findIndex(s => stepStatus(s.role) === 'process')}
      items={steps.map(s => {
        const sig = sigMap.get(s.role);
        const status = stepStatus(s.role);
        return {
          title: (
            <Space>
              <Text strong>{s.title}</Text>
              {sig && <Tag color={getRoleColor(s.role)}>{sig.userName}</Tag>}
            </Space>
          ),
          description: sig ? (
            <div style={{ fontSize: 12 }}>
              <div>{sig.signedAt}</div>
              <div>IP: {sig.ipAddress}</div>
              <div>理由: {sig.reason}</div>
            </div>
          ) : (
            status === 'process' && <Text type="secondary" style={{ fontSize: 12 }}>待签名</Text>
          ),
          status: status,
        };
      })}
    />
  );
};

/** 报告水印 */
const WatermarkOverlay: React.FC<{ text: string }> = ({ text }) => (
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none', overflow: 'hidden',
  }}>
    <div style={{
      fontSize: 48, fontWeight: 'bold', color: 'rgba(0,0,0,0.06)',
      transform: 'rotate(-30deg)', whiteSpace: 'nowrap',
      userSelect: 'none',
    }}>
      {text}
    </div>
  </div>
);

/** PDF Preview (Simplified) */
const PdfPreviewPanel: React.FC<{ report: Report }> = ({ report }) => {
  const { cover } = report;
  const issued = report.status === 'issued';
  const issuedDate = report.signatures.find(s => s.role === 'approver')?.signedAt;
  const watermarkText = issued ? `已签发 ${issuedDate ? new Date(issuedDate).toLocaleDateString() : ''}` : '';
  return (
    <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 24, minHeight: 400, position: 'relative' }}>
      {issued && <WatermarkOverlay text={watermarkText} />}
      <div
        style={{
          background: '#fff',
          maxWidth: 420,
          margin: '0 auto',
          padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>{cover.companyName}</Title>
          <Divider />
          <Title level={3} style={{ margin: '8px 0', color: '#1677ff' }}>{cover.reportTitle}</Title>
          <Text type="secondary">{cover.reportNo}</Text>
        </div>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="委托单位">{cover.entrustUnit}</Descriptions.Item>
          <Descriptions.Item label="项目名称">{cover.projectName}</Descriptions.Item>
          <Descriptions.Item label="样品类型">{cover.sampleType}</Descriptions.Item>
          <Descriptions.Item label="采样地点">{cover.samplingLocation}</Descriptions.Item>
          <Descriptions.Item label="采样日期">{cover.samplingDate}</Descriptions.Item>
          <Descriptions.Item label="检测日期">{cover.testDate}</Descriptions.Item>
          <Descriptions.Item label="签发日期">{cover.issueDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="共 {cover.pageCount} 页">{cover.pageCount} 页</Descriptions.Item>
        </Descriptions>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>红创检测认证有限公司</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>检测专用章</Text>
        </div>
      </div>
    </div>
  );
};

// ================================================
// Main Page Component
// ================================================

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ draft: 0, pendingTechReview: 0, pendingApproval: 0, issued: 0, total: 0 });
  const [filters, setFilters] = useState({ keyword: '', status: '', customer: '', dateRange: [null, null] as any[] });

  // Detail Drawer
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailTab, setDetailTab] = useState('info');
  const [flowHistory, setFlowHistory] = useState<any[]>([]);

  // Compilation Mode
  const [compileOpen, setCompileOpen] = useState(false);
  const [editReport, setEditReport] = useState<Report | null>(null);
  const [editTab, setEditTab] = useState('cover');

  // Review / Signature Modals
  const [reviewOpen, setReviewOpen] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signRole, setSignRole] = useState<'compiler' | 'reviewer' | 'approver'>('compiler');
  const [signRoleLabel, setSignRoleLabel] = useState('编制');

  // Signature Verification
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  // Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // ============ Data Loading ============

  const loadReports = () => {
    setLoading(true);
    fetch('/api/v1/reports').then(r => r.json()).then(res => {
      if (res.code === 200) {
        setReports(res.data.list);
      }
      setLoading(false);
    });
    fetch('/api/v1/reports/stats').then(r => r.json()).then(res => {
      if (res.code === 200) setStats(res.data);
    });
  };

  useEffect(() => { loadReports(); }, []);

  // ============ Detail Drawer ============

  const showDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailOpen(true);
    setDetailTab('info');
    setFlowHistory([]);
    fetch(`/api/v1/reports/${report.id}/flow-history`).then(r => r.json()).then(res => {
      if (res.code === 200) setFlowHistory(res.data);
    });
  };

  // ============ Compilation ============

  const openCompile = (report?: Report) => {
    setEditReport(report ? { ...report } : null);
    setEditTab('cover');
    setCompileOpen(true);
  };

  const handleSaveCompile = async () => {
    if (!editReport) return;
    const method = reports.find(r => r.id === editReport.id) ? 'PUT' : 'POST';
    const url = editReport.id ? `/api/v1/reports/${editReport.id}` : '/api/v1/reports';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editReport),
    }).then(r => r.json());
    if (res.code === 200) {
      message.success('保存成功');
      setCompileOpen(false);
      loadReports();
    }
  };

  // ============ Actions ============

  const handleSubmitForReview = (report: Report) => {
    setSignRole('compiler');
    setSignRoleLabel('编制');
    setSignModalOpen(true);
  };

  // ============ Signature Verification ============

  const handleVerifySignature = async (reportId: string) => {
    setVerifyLoading(true);
    setVerifyOpen(true);
    try {
      const res = await fetch('/api/v1/signatures/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: reportId }),
      }).then(r => r.json());
      if (res.code === 200) {
        setVerifyResult(res.data);
      } else {
        setVerifyResult({ valid: false, details: ['验真服务不可用'] });
      }
    } catch {
      setVerifyResult({ valid: false, details: ['验真请求失败'] });
    }
    setVerifyLoading(false);
  };

  const handleSign = async (data: { password: string; reason: string; role: string; meaning: string; meaningStatement: string }) => {
    if (!selectedReport) return;

    // Use new SM2/SM3 signature API
    const sigPayload = {
      documentId: selectedReport.id,
      documentType: 'REPORT',
      meaning: data.meaning,
      password: data.password,
      meaningStatement: data.meaningStatement,
    };

    const sigRes = await fetch(`/api/v1/signatures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sigPayload),
    }).then(r => r.json());

    if (sigRes.code === 200) {
      message.success(`签名成功 (SM2/SM3)`);
      loadReports();
      showDetail(selectedReport);
    } else if (sigRes.code === 401) {
      message.error('签名密码错误');
    } else {
      message.error('签名失败: ' + (sigRes.message || '未知错误'));
    }
  };

  const handleReview = (report: Report) => {
    setSelectedReport(report);
    setReviewOpen(true);
  };

  const handleReviewSubmit = async (data: { conclusion: string; opinion: string; checklist: ReviewChecklistItem[] }) => {
    if (!selectedReport) return;
    const reviewPayload = {
      conclusion: data.conclusion,
      opinion: data.opinion,
      checklist: data.checklist,
      reviewerId: '2',
      reviewerName: '张伟',
    };
    await fetch(`/api/v1/reports/${selectedReport.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewPayload),
    });
    message.success('审核完成');
    loadReports();
  };

  const handleDelete = (report: Report) => {
    Modal.confirm({
      title: `确定删除报告 ${report.reportNo}？`,
      content: '此操作不可恢复',
      onOk: () => {
        setReports(prev => prev.filter(r => r.id !== report.id));
        message.success('删除成功');
      },
    });
  };

  const handleBatchSign = () => {
    const count = selectedRowKeys.length;
    const toSign = reports.filter(r => selectedRowKeys.includes(r.id) && r.status === 'tech_reviewed');
    if (toSign.length === 0) {
      message.warning('选中的报告中没有待批准签发的报告');
      return;
    }
    Modal.confirm({
      title: `批量签发 ${toSign.length} 份报告`,
      content: `将以批准人身份签发选中的 ${toSign.length} 份报告。
操作不可撤销，确定继续吗？`,
      onOk: () => {
        setReports(prev => prev.map(r =>
          selectedRowKeys.includes(r.id) && r.status === 'tech_reviewed'
            ? { ...r, status: 'issued', signatures: [...r.signatures, { role: 'approver', name: '当前用户', signedAt: new Date().toISOString() }] }
            : r
        ));
        setSelectedRowKeys([]);
        message.success(`已签发 ${toSign.length} 份报告`);
      },
    });
  };

  const handleBatchDelete = () => {
    const count = selectedRowKeys.length;
    Modal.confirm({
      title: `确定删除选中的 ${count} 条报告？`,
      content: '此操作不可恢复',
      onOk: () => {
        setReports(prev => prev.filter(r => !selectedRowKeys.includes(r.id)));
        setSelectedRowKeys([]);
        message.success(`已删除 ${count} 条报告`);
      },
    });
  };

  // ============ Annotation Handlers ============

  const handleAddAnnotation = async (content: string, mentions: string[]) => {
    if (!selectedReport) return;
    const annPayload = {
      content,
      authorId: '3',
      authorName: '李思',
      mentions,
    };
    const res = await fetch(`/api/v1/reports/${selectedReport.id}/annotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(annPayload),
    }).then(r => r.json());
    if (res.code === 200) {
      message.success('批注已添加');
      showDetail(selectedReport);
    }
  };

  const handleResolveAnnotation = (annId: string) => {
    if (!selectedReport) return;
    const updated = { ...selectedReport };
    updated.annotations = updated.annotations.map(a =>
      a.id === annId ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toISOString(), resolvedBy: '李思' } : a
    );
    setSelectedReport(updated);
    message.success('批注已解决');
  };

  const handleReplyToAnnotation = (annId: string, content: string) => {
    if (!selectedReport) return;
    const reply: ReportAnnotationReply = {
      id: `reply-${Date.now()}`,
      content,
      authorId: '3',
      authorName: '李思',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    const updated = { ...selectedReport };
    updated.annotations = updated.annotations.map(a =>
      a.id === annId ? { ...a, replies: [...a.replies, reply] } : a
    );
    setSelectedReport(updated);
  };

  // ============ Table Column ============

  const columns: ColumnsType<Report> = [
    { title: '报告编号', dataIndex: 'reportNo', key: 'reportNo', width: 160 },
    { title: '报告名称', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 150, ellipsis: true },
    { title: '样品编号', dataIndex: 'sampleNos', key: 'sampleNos', width: 160, render: (nos: string[]) => nos?.join(', ') },
    {
      title: '编制人', dataIndex: 'creatorName', key: 'creatorName', width: 90,
    },
    {
      title: '状态', dataIndex: 'statusLabel', key: 'status', width: 110,
      render: (v: string, record: Report) => (
        <Tag color={getStatusColor(record.status)}>{v}</Tag>
      ),
    },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160,
    },
    {
      title: '操作', key: 'action', width: 220, fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => showDetail(record)}>
            <EyeOutlined /> 详情
          </Button>
          {(record.status === 'draft' || record.status === 'pending_tech_review') && (
            <Button type="link" size="small" onClick={() => openCompile(record)}>
              <EditOutlined /> 编辑
            </Button>
          )}
          {record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => { setSelectedReport(record); handleSubmitForReview(record); }}>
              <SendOutlined /> 提交
            </Button>
          )}
          {record.status === 'pending_tech_review' && (
            <Button type="link" size="small" onClick={() => handleReview(record)}>
              <AuditOutlined /> 审核
            </Button>
          )}
          {record.status === 'pending_approval' && (
            <Button type="link" size="small" onClick={() => { setSelectedReport(record); setSignRole('approver'); setSignRoleLabel('批准签发'); setSignModalOpen(true); }}>
              <SignatureOutlined /> 签发
            </Button>
          )}
          {record.status === 'issued' && (
            <Button type="link" size="small" onClick={() => { showDetail(record); setTimeout(() => setDetailTab('verify'), 300); }}>
              <SafetyCertificateOutlined /> 验真
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // ============ Render ============

  // Stats for KPI cards
  const kpiCards = [
    { title: '待撰写', value: stats.draft, color: '#1677ff', icon: <EditOutlined />, status: 'draft' },
    { title: '待技术审核', value: stats.pendingTechReview, color: '#faad14', icon: <AuditOutlined />, status: 'pending_tech_review' },
    { title: '待批准签发', value: stats.pendingApproval, color: '#722ed1', icon: <SignatureOutlined />, status: 'pending_approval' },
    { title: '已签发', value: stats.issued, color: '#52c41a', icon: <CheckCircleOutlined />, status: 'issued' },
  ];

  return (
    <div>
      {/* ======== KPI Cards ======== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiCards.map((kpi, i) => (
          <Col span={6} key={i}>
            <Card hoverable>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: kpi.color + '15', color: kpi.color, fontSize: 24,
                  }}
                >
                  {kpi.icon}
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: 14 }}>{kpi.title}</div>
                  <div style={{ fontSize: 32, fontWeight: 'bold' }}>{kpi.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ======== Filters ======== */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={5}>
            <Input
              placeholder="报告编号/名称"
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={e => setFilters({ ...filters, keyword: e.target.value })}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="客户名称"
              style={{ width: '100%' }}
              allowClear
              value={filters.customer || undefined}
              onChange={v => setFilters({ ...filters, customer: v })}
            >
              {customers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="报告状态"
              style={{ width: '100%' }}
              allowClear
              value={filters.status || undefined}
              onChange={v => setFilters({ ...filters, status: v })}
            >
              {reportStatuses.map(s => <Option key={s.value} value={s.value}>{s.label}</Option>)}
            </Select>
          </Col>
          <Col span={5}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              placeholder={['创建开始', '创建结束']}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates || [null, null] })}
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button onClick={() => setFilters({ keyword: '', status: '', customer: '', dateRange: [null, null] })}>
                重置
              </Button>
              <Button type="primary" onClick={loadReports}>查询</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ======== Action Bar ======== */}
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCompile()}>
          新建报告
        </Button>
        <Button icon={<ExportOutlined />}>导出</Button>
        <Button icon={<PrinterOutlined />}>打印</Button>
        {selectedRowKeys.length > 0 && (
          <Button icon={<CheckCircleOutlined />} style={{ color: '#52c41a', borderColor: '#52c41a' }} onClick={handleBatchSign}>
            批量签发 ({selectedRowKeys.length})
          </Button>
        )}
        {selectedRowKeys.length > 0 && (
          <Button icon={<DeleteOutlined />} danger onClick={handleBatchDelete}>
            删除 ({selectedRowKeys.length})
          </Button>
        )}
      </Space>

      {/* ======== Table ======== */}
      <Card>
        <Table
          dataSource={reports}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
        />
      </Card>

      {/* ======== Detail Drawer ======== */}
      <Drawer
        title={
          <Space>
            <FileTextOutlined />
            <span>{selectedReport?.reportNo}</span>
            {selectedReport && <Tag color={getStatusColor(selectedReport.status)}>{selectedReport.statusLabel}</Tag>}
          </Space>
        }
        width={680}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        {selectedReport && (
          <Tabs
            activeKey={detailTab}
            onChange={setDetailTab}
            items={[
              {
                key: 'info',
                label: <span><FileTextOutlined /> 报告信息</span>,
                children: (
                  <>
                    <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="报告编号">{selectedReport.reportNo}</Descriptions.Item>
                        <Descriptions.Item label="报告名称">{selectedReport.title}</Descriptions.Item>
                        <Descriptions.Item label="客户">{selectedReport.customerName}</Descriptions.Item>
                        <Descriptions.Item label="项目">{selectedReport.projectName}</Descriptions.Item>
                        <Descriptions.Item label="样品类型">{selectedReport.sampleTypeLabel}</Descriptions.Item>
                        <Descriptions.Item label="采样地点">{selectedReport.samplingLocation}</Descriptions.Item>
                        <Descriptions.Item label="编制人">{selectedReport.creatorName}</Descriptions.Item>
                        <Descriptions.Item label="创建时间">{selectedReport.createdAt}</Descriptions.Item>
                        <Descriptions.Item label="更新时间">{selectedReport.updatedAt}</Descriptions.Item>
                        <Descriptions.Item label="签发时间">{selectedReport.issuedAt || '-'}</Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="报告封面" size="small" style={{ marginBottom: 16 }}>
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="公司名称">{selectedReport.cover.companyName}</Descriptions.Item>
                        <Descriptions.Item label="委托单位">{selectedReport.cover.entrustUnit}</Descriptions.Item>
                        <Descriptions.Item label="样品类型">{selectedReport.cover.sampleType}</Descriptions.Item>
                        <Descriptions.Item label="采样地点">{selectedReport.cover.samplingLocation}</Descriptions.Item>
                        <Descriptions.Item label="采样日期">{selectedReport.cover.samplingDate}</Descriptions.Item>
                        <Descriptions.Item label="检测日期">{selectedReport.cover.testDate}</Descriptions.Item>
                        <Descriptions.Item label="签发日期">{selectedReport.cover.issueDate || '-'}</Descriptions.Item>
                        <Descriptions.Item label="页数">{selectedReport.cover.pageCount} 页</Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="检测结果" size="small" style={{ marginBottom: 16 }}>
                      <Table
                        dataSource={selectedReport.testResults}
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={[
                          { title: '序号', dataIndex: 'seq', key: 'seq', width: 50 },
                          { title: '检测项目', dataIndex: 'itemName', key: 'itemName' },
                          { title: '单位', dataIndex: 'unit', key: 'unit', width: 70 },
                          { title: '结果', dataIndex: 'result', key: 'result', width: 100 },
                          { title: '检出限', dataIndex: 'detectionLimit', key: 'detectionLimit', width: 80 },
                          { title: '限值', dataIndex: 'limitValue', key: 'limitValue', width: 100 },
                          { title: '方法', dataIndex: 'method', key: 'method', width: 120 },
                          { title: '判定', dataIndex: 'judgment', key: 'judgment', width: 80,
                            render: (v: string) => (
                              <Tag color={v === '合格' ? 'success' : v === '不合格' ? 'error' : 'default'}>{v}</Tag>
                            ),
                          },
                        ]}
                      />
                    </Card>

                    <Card title="电子签名记录" size="small" style={{ marginBottom: 16 }}>
                      {selectedReport.signatures.length === 0 ? (
                        <Empty description="暂无签名记录" />
                      ) : (
                        <Table
                          dataSource={selectedReport.signatures}
                          rowKey="id"
                          size="small"
                          pagination={false}
                          columns={[
                            { title: '角色', dataIndex: 'roleLabel', key: 'roleLabel', width: 80,
                              render: (v: string, r: ReportSignature) => <Tag color={getRoleColor(r.role)}>{v}</Tag>,
                            },
                            { title: '签名人', dataIndex: 'userName', key: 'userName', width: 80 },
                            { title: '签名时间', dataIndex: 'signedAt', key: 'signedAt', width: 160 },
                            { title: '理由', dataIndex: 'reason', key: 'reason', ellipsis: true },
                            { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress', width: 120 },
                          ]}
                        />
                      )}
                    </Card>

                    <Card title="附件" size="small" style={{ marginBottom: 16 }}>
                      {selectedReport.attachments.length === 0 ? (
                        <Empty description="暂无附件" />
                      ) : (
                        <List
                          dataSource={selectedReport.attachments}
                          renderItem={(a: ReportAttachment) => (
                            <List.Item actions={[<Button type="link" icon={<DownloadOutlined />}>下载</Button>]}>
                              <List.Item.Meta
                                avatar={<PaperClipOutlined style={{ fontSize: 20 }} />}
                                title={a.name}
                                description={`${a.size} · ${a.uploader} · ${a.uploadedAt}`}
                              />
                            </List.Item>
                          )}
                        />
                      )}
                    </Card>

                    <FlowStepIndicator report={selectedReport} />

                    <Card title="流转记录" size="small" style={{ marginTop: 16 }}>
                      {flowHistory.length === 0 ? (
                        <Empty description="暂无流转记录" />
                      ) : (
                        <Timeline
                          items={flowHistory.map((h: any) => ({
                            color: 'blue',
                            children: (
                              <div>
                                <Text strong>{h.action}</Text>
                                <div style={{ fontSize: 12, color: '#999' }}>{h.user} · {h.time}</div>
                                <div style={{ fontSize: 12 }}>{h.desc}</div>
                              </div>
                            ),
                          }))}
                        />
                      )}
                    </Card>
                  </>
                ),
              },
              {
                key: 'flow',
                label: <span><SafetyCertificateOutlined /> 流程步骤</span>,
                children: (
                  <>
                    <FlowStepIndicator report={selectedReport} />
                    <Divider />
                    <Card title="操作" size="small">
                      {selectedReport.status === 'draft' && (
                        <Button type="primary" icon={<SendOutlined />} block onClick={() => { setSignModalOpen(true); setSignRole('compiler'); setSignRoleLabel('编制'); }}>
                          提交审核（电子签名）
                        </Button>
                      )}
                      {selectedReport.status === 'pending_tech_review' && (
                        <Button type="primary" icon={<AuditOutlined />} block onClick={() => setReviewOpen(true)}>
                          技术审核
                        </Button>
                      )}
                      {selectedReport.status === 'pending_approval' && (
                        <Button type="primary" icon={<SignatureOutlined />} block onClick={() => { setSignModalOpen(true); setSignRole('approver'); setSignRoleLabel('批准签发'); }}>
                          批准签发（电子签名）
                        </Button>
                      )}
                      {selectedReport.status === 'issued' && (
                        <div>
                          <Alert message="报告已签发" type="success" showIcon style={{ marginBottom: 16 }} />
                          <Button
                            type="primary"
                            icon={<SafetyCertificateOutlined />}
                            onClick={() => { setDetailTab('verify'); handleVerifySignature(selectedReport.id); }}
                            loading={verifyLoading}
                            block
                          >
                            签名验真
                          </Button>
                        </div>
                      )}
                    </Card>
                  </>
                ),
              },
              {
                key: 'preview',
                label: <span><FileTextOutlined /> PDF预览</span>,
                children: <PdfPreviewPanel report={selectedReport} />,
              },
              {
                key: 'annotations',
                label: <span><CommentOutlined /> 批注 ({selectedReport.annotations.length})</span>,
                children: (
                  <AnnotationsPanel
                    annotations={selectedReport.annotations}
                    reportId={selectedReport.id}
                    onAdd={handleAddAnnotation}
                    onResolve={handleResolveAnnotation}
                    onReply={handleReplyToAnnotation}
                  />
                ),
              },
              {
                key: 'history',
                label: <span><HistoryOutlined /> 变更历史</span>,
                children: <ChangeHistoryPanel history={selectedReport.changeHistory} />,
              },
              {
                key: 'verify',
                label: <span><SafetyCertificateOutlined /> 签名验真</span>,
                children: (
                  <div>
                    {selectedReport.status !== 'issued' && selectedReport.signatures.length === 0 ? (
                      <Empty description="报告尚未签名，无法验真" />
                    ) : (
                      <>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                          <QRCodeDisplay
                            value={`hc-lims://verify/${selectedReport.id}`}
                            size={160}
                          />
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>扫一扫验真</Text>
                          </div>
                        </div>

                        <Card size="small" style={{ marginBottom: 16 }}>
                          <Descriptions column={1} size="small">
                            <Descriptions.Item label="报告编号">{selectedReport.reportNo}</Descriptions.Item>
                            <Descriptions.Item label="报告名称">{selectedReport.title}</Descriptions.Item>
                            <Descriptions.Item label="签发日期">{selectedReport.issuedAt || '-'}</Descriptions.Item>
                          </Descriptions>
                        </Card>

                        <Button
                          type="primary"
                          icon={<SafetyCertificateOutlined />}
                          loading={verifyLoading}
                          onClick={() => handleVerifySignature(selectedReport.id)}
                          style={{ width: '100%', marginBottom: 16 }}
                        >
                          立即验真
                        </Button>

                        {verifyResult && (
                          <Card
                            size="small"
                            title={
                              <Space>
                                {verifyResult.valid ? (
                                  <><CheckCircleOutlined style={{ color: '#52c41a' }} /><Text strong style={{ color: '#52c41a' }}>签名有效</Text></>
                                ) : (
                                  <><CloseCircleOutlined style={{ color: '#f5222d' }} /><Text strong style={{ color: '#f5222d' }}>签名无效</Text></>
                                )}
                              </Space>
                            }
                          >
                            {verifyResult.signatures && verifyResult.signatures.length > 0 && (
                              <Timeline
                                items={verifyResult.signatures.map((sig: any) => ({
                                  color: sig.status === 'valid' ? 'green' : 'red',
                                  children: (
                                    <div>
                                      <Space>
                                        <Tag color={sig.meaning === 'PREPARED' ? 'blue' : sig.meaning === 'REVIEWED' ? 'orange' : 'green'}>
                                          {sig.meaningLabel}
                                        </Tag>
                                        <Text strong>{sig.signerName}</Text>
                                      </Space>
                                      <div style={{ fontSize: 12, color: '#999' }}>{sig.time}</div>
                                      <div style={{ fontSize: 12, color: '#666' }}>{sig.certSubject}</div>
                                    </div>
                                  ),
                                }))}
                              />
                            )}
                            <Divider />
                            {verifyResult.details && verifyResult.details.map((d: string, i: number) => (
                              <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
                                {d.startsWith('⚠️') ? (
                                  <><CloseCircleOutlined style={{ color: '#f5222d', marginRight: 4 }} /><Text type="danger">{d}</Text></>
                                ) : (
                                  <><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} /><Text type="secondary">{d}</Text></>
                                )}
                              </div>
                            ))}
                            <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>
                              验真时间: {verifyResult.verifiedAt}
                            </div>
                          </Card>
                        )}

                        {!verifyResult && (
                          <Card size="small">
                            <Descriptions column={1} size="small">
                              <Descriptions.Item label="编制人">
                                {selectedReport.signatures.find(s => s.role === 'compiler')?.userName || '-'}
                                {' · '}
                                {selectedReport.signatures.find(s => s.role === 'compiler')?.signedAt || '-'}
                              </Descriptions.Item>
                              <Descriptions.Item label="审核人">
                                {selectedReport.signatures.find(s => s.role === 'reviewer')?.userName || '-'}
                                {' · '}
                                {selectedReport.signatures.find(s => s.role === 'reviewer')?.signedAt || '-'}
                              </Descriptions.Item>
                              <Descriptions.Item label="批准人">
                                {selectedReport.signatures.find(s => s.role === 'approver')?.userName || '-'}
                                {' · '}
                                {selectedReport.signatures.find(s => s.role === 'approver')?.signedAt || '-'}
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        )}
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* ======== Compilation Drawer (编辑/编制) ======== */}
      <Drawer
        title={<span><EditOutlined /> {editReport?.id ? '编辑报告' : '新建报告'}</span>}
        width={860}
        open={compileOpen}
        onClose={() => setCompileOpen(false)}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setCompileOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleSaveCompile}>保存</Button>
          </Space>
        }
      >
        {editReport !== null && (
          <Tabs
            activeKey={editTab}
            onChange={setEditTab}
            items={[
              {
                key: 'cover',
                label: '封面信息',
                children: (
                  <>
                    <Alert message="填写报告封面基本信息" type="info" showIcon style={{ marginBottom: 16 }} />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="公司名称" required>
                          <Input
                            value={editReport.cover.companyName}
                            onChange={e => setEditReport({
                              ...editReport,
                              cover: { ...editReport.cover, companyName: e.target.value }
                            })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="报告编号" required>
                          <Input
                            value={editReport.reportNo}
                            onChange={e => setEditReport({ ...editReport, reportNo: e.target.value })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="委托单位" required>
                          <Select
                            value={editReport.customerId}
                            style={{ width: '100%' }}
                            onChange={v => {
                              const c = customers.find(c => c.id === v);
                              setEditReport({
                                ...editReport,
                                customerId: v,
                                customerName: c?.name || '',
                                cover: { ...editReport.cover, entrustUnit: c?.name || '' },
                              });
                            }}
                          >
                            {customers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="项目名称" required>
                          <Select
                            value={editReport.projectId}
                            style={{ width: '100%' }}
                            onChange={v => {
                              const p = projects.find(p => p.id === v);
                              setEditReport({
                                ...editReport,
                                projectId: v,
                                projectName: p?.name || '',
                                cover: { ...editReport.cover, projectName: p?.name || '' },
                              });
                            }}
                          >
                            {projects.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="样品类型" required>
                          <Select
                            value={editReport.sampleType}
                            style={{ width: '100%' }}
                            onChange={v => {
                              const t = sampleTypes.find(t => t.value === v);
                              setEditReport({
                                ...editReport,
                                sampleType: v,
                                sampleTypeLabel: t?.label || '',
                                cover: { ...editReport.cover, sampleType: t?.label || '' },
                              });
                            }}
                          >
                            {sampleTypes.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="采样地点">
                          <Input
                            value={editReport.samplingLocation}
                            onChange={e => setEditReport({
                              ...editReport,
                              samplingLocation: e.target.value,
                              cover: { ...editReport.cover, samplingLocation: e.target.value },
                            })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="采样日期">
                          <Input
                            value={editReport.samplingDate}
                            onChange={e => setEditReport({
                              ...editReport,
                              samplingDate: e.target.value,
                              cover: { ...editReport.cover, samplingDate: e.target.value },
                            })}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
              {
                key: 'results',
                label: '检测结果',
                children: (
                  <>
                    <Alert message="编辑检测结果数据" type="info" showIcon style={{ marginBottom: 16 }} />
                    <Table
                      dataSource={editReport.testResults}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      columns={[
                        { title: '序号', dataIndex: 'seq', key: 'seq', width: 50 },
                        { title: '项目', dataIndex: 'itemName', key: 'itemName', width: 150 },
                        { title: '单位', dataIndex: 'unit', key: 'unit', width: 70 },
                        {
                          title: '结果', dataIndex: 'result', key: 'result', width: 120,
                          render: (v: string, _: ReportTestResult, idx: number) => (
                            <Input
                              size="small"
                              value={v}
                              onChange={e => {
                                const next = [...editReport.testResults];
                                next[idx] = { ...next[idx], result: e.target.value };
                                setEditReport({ ...editReport, testResults: next });
                              }}
                            />
                          ),
                        },
                        { title: '检出限', dataIndex: 'detectionLimit', key: 'detectionLimit', width: 80 },
                        { title: '限值', dataIndex: 'limitValue', key: 'limitValue', width: 100 },
                        { title: '方法', dataIndex: 'method', key: 'method', width: 120 },
                        {
                          title: '判定', dataIndex: 'judgment', key: 'judgment', width: 100,
                          render: (v: string, _: ReportTestResult, idx: number) => (
                            <Select
                              size="small"
                              value={v}
                              style={{ width: 90 }}
                              onChange={val => {
                                const next = [...editReport.testResults];
                                next[idx] = { ...next[idx], judgment: val };
                                setEditReport({ ...editReport, testResults: next });
                              }}
                            >
                              <Option value="合格">合格</Option>
                              <Option value="不合格">不合格</Option>
                              <Option value="-">-</Option>
                            </Select>
                          ),
                        },
                      ]}
                    />
                  </>
                ),
              },
              {
                key: 'signatures',
                label: '签名区',
                children: (
                  <>
                    <Alert message="签名将在提交审核时进行，此处仅管理签名角色信息" type="info" showIcon style={{ marginBottom: 16 }} />
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="编制人">
                        {editReport.signatures.find(s => s.role === 'compiler')?.userName || '待签名'} 
                        {editReport.signatures.find(s => s.role === 'compiler') && ' ✓'}
                      </Descriptions.Item>
                      <Descriptions.Item label="技术审核人">
                        {editReport.signatures.find(s => s.role === 'reviewer')?.userName || '待审核'}
                      </Descriptions.Item>
                      <Descriptions.Item label="批准人">
                        {editReport.signatures.find(s => s.role === 'approver')?.userName || '待批准'}
                      </Descriptions.Item>
                    </Descriptions>
                    <Divider />
                    <Space>
                      {!editReport.signatures.find(s => s.role === 'compiler') && (
                        <Button
                          icon={<SignatureOutlined />}
                          onClick={() => {
                            message.info('请在流程步骤中提交审核进行签名');
                          }}
                        >
                          编制人签名
                        </Button>
                      )}
                    </Space>
                  </>
                ),
              },
              {
                key: 'attachments',
                label: '附件',
                children: (
                  <>
                    <Upload.Dragger
                      name="file"
                      multiple
                      beforeUpload={(file) => {
                        const newAtt: ReportAttachment = {
                          id: `att-${Date.now()}`,
                          name: file.name,
                          type: file.name.endsWith('.pdf') ? 'pdf' : 'other',
                          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                          uploadedAt: new Date().toLocaleString('zh-CN'),
                          uploader: '李思',
                          url: '#',
                        };
                        setEditReport({
                          ...editReport,
                          attachments: [...editReport.attachments, newAtt],
                        });
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <p className="ant-upload-drag-icon">
                        <CloudUploadOutlined />
                      </p>
                      <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                      <p className="ant-upload-hint">支持 PDF、Word、Excel 格式</p>
                    </Upload.Dragger>
                    {editReport.attachments.length > 0 && (
                      <List
                        dataSource={editReport.attachments}
                        style={{ marginTop: 16 }}
                        renderItem={(a, idx) => (
                          <List.Item
                            actions={[
                              <Button
                                key="del"
                                type="link"
                                danger
                                size="small"
                                onClick={() => {
                                  const next = editReport.attachments.filter((_, i) => i !== idx);
                                  setEditReport({ ...editReport, attachments: next });
                                }}
                              >
                                删除
                              </Button>,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<PaperClipOutlined style={{ fontSize: 20 }} />}
                              title={a.name}
                              description={`${a.size} · ${a.uploadedAt}`}
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </>
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* ======== Review Modal ======== */}
      <ReviewModal
        open={reviewOpen}
        onClose={() => { setReviewOpen(false); setSelectedReport(null); }}
        onSubmit={(data) => {
          handleReviewSubmit(data);
          setReviewOpen(false);
        }}
        report={selectedReport}
      />

      {/* ======== Signature Modal ======== */}
      <SignatureModal
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        onSign={(data) => {
          handleSign(data);
          setSignModalOpen(false);
        }}
        role={signRole}
        roleLabel={signRoleLabel}
        reportId={selectedReport?.id}
      />
    </div>
  );
};

export default ReportsPage;
