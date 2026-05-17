import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Badge, Modal, Form, Input, Select, message, Timeline, Drawer, Popconfirm, Descriptions, Divider
} from 'antd';
import {
  PlusOutlined, ApartmentOutlined, CheckCircleOutlined,
  PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined, EditOutlined,
  EyeOutlined, SendOutlined, SwapOutlined, StopOutlined,
  GatewayOutlined, MailOutlined, FlagOutlined, CheckSquareOutlined,
  TeamOutlined, ClockCircleOutlined, FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const api = (path: string) => `/api/v1${path}`;

// ===================== Types =====================
type NodeType = 'start' | 'approval' | 'countersign' | 'condition' | 'parallel' | 'cc' | 'delay' | 'subprocess' | 'end';
type WFStatus = 'draft' | 'deployed' | 'disabled';
type InstStatus = 'running' | 'completed' | 'terminated' | 'suspended';

interface WFNode {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  config?: Record<string, any>;
}

interface WFEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

interface WFDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  nodes: WFNode[];
  edges: WFEdge[];
  status: WFStatus;
  version: number;
  usedCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface WFHistoryItem {
  id: string;
  nodeId: string;
  nodeName: string;
  action: string;
  operator: string;
  comment?: string;
  timestamp: string;
}

interface WFInstance {
  id: string;
  defId: string;
  defName: string;
  defVersion: number;
  businessType: string;
  businessId: string;
  businessSummary: string;
  status: InstStatus;
  currentNodes: string[];
  currentNodeNames: string[];
  assignees: string[];
  variables: Record<string, any>;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  history: WFHistoryItem[];
}

// ===================== Constants =====================
const NODE_TYPES: { type: NodeType; label: string; color: string; icon: React.ReactNode }[] = [
  { type: 'start', label: '开始', color: '#52c41a', icon: <FlagOutlined /> },
  { type: 'approval', label: '审批', color: '#1890ff', icon: <CheckSquareOutlined /> },
  { type: 'countersign', label: '会签', color: '#722ed1', icon: <TeamOutlined /> },
  { type: 'condition', label: '条件分支', color: '#faad14', icon: <GatewayOutlined /> },
  { type: 'parallel', label: '并行', color: '#eb2f96', icon: <ApartmentOutlined /> },
  { type: 'cc', label: '抄送', color: '#13c2c2', icon: <MailOutlined /> },
  { type: 'delay', label: '延时', color: '#fa8c16', icon: <ClockCircleOutlined /> },
  { type: 'subprocess', label: '子流程', color: '#2f54eb', icon: <FileTextOutlined /> },
  { type: 'end', label: '结束', color: '#ff4d4f', icon: <CheckCircleOutlined /> },
];

const NODE_WIDTH = 140;
const NODE_HEIGHT = 50;

const statusMap: Record<WFStatus, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  deployed: { text: '已部署', color: 'success' },
  disabled: { text: '已停用', color: 'warning' },
};

const instStatusMap: Record<InstStatus, { text: string; color: string }> = {
  running: { text: '运行中', color: 'processing' },
  completed: { text: '已完成', color: 'success' },
  terminated: { text: '已终止', color: 'error' },
  suspended: { text: '已挂起', color: 'warning' },
};

// ===================== Helper: Generate ID =====================
const genId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ===================== Sub-Components =====================

/** Flow Designer Canvas */
const FlowDesigner: React.FC<{
  value: { nodes: WFNode[]; edges: WFEdge[] };
  onChange: (v: { nodes: WFNode[]; edges: WFEdge[] }) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragNode, setDragNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState<string | null>(null);

  const { nodes, edges } = value;

  const updateNodes = (newNodes: WFNode[]) => onChange({ nodes: newNodes, edges });
  const updateEdges = (newEdges: WFEdge[]) => onChange({ nodes, edges: newEdges });

  // Drag from palette
  const handlePaletteDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('nodeType', type);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as NodeType;
    if (!type || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - NODE_WIDTH / 2;
    const y = e.clientY - rect.top - NODE_HEIGHT / 2;
    const newNode: WFNode = {
      id: genId('node'),
      type,
      name: NODE_TYPES.find((n) => n.type === type)?.label || type,
      x: Math.max(0, x),
      y: Math.max(0, y),
      config: {},
    };
    updateNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  // Move node on canvas
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDragNode({ id: nodeId, offsetX: e.clientX - node.x, offsetY: e.clientY - node.y });
    setSelectedNodeId(nodeId);
  };

  useEffect(() => {
    if (!dragNode) return;
    const handleMove = (e: MouseEvent) => {
      const newX = e.clientX - dragNode.offsetX;
      const newY = e.clientY - dragNode.offsetY;
      updateNodes(nodes.map((n) => (n.id === dragNode.id ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) } : n)));
    };
    const handleUp = () => setDragNode(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragNode, nodes]);

  // Click canvas to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNodeId(null);
      setConnectSource(null);
      setConnectMode(false);
    }
  };

  // Delete node
  const deleteNode = (nodeId: string) => {
    updateNodes(nodes.filter((n) => n.id !== nodeId));
    updateEdges(edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  };

  // Connection logic
  const handleNodeClickForConnect = (nodeId: string) => {
    if (!connectMode || readOnly) return;
    if (!connectSource) {
      setConnectSource(nodeId);
    } else if (connectSource !== nodeId) {
      const exists = edges.find((e) => e.source === connectSource && e.target === nodeId);
      if (!exists) {
        updateEdges([...edges, { id: genId('edge'), source: connectSource, target: nodeId }]);
      }
      setConnectSource(null);
    }
  };

  // Update selected node config
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const getEdgePath = (edge: WFEdge) => {
    const src = nodes.find((n) => n.id === edge.source);
    const tgt = nodes.find((n) => n.id === edge.target);
    if (!src || !tgt) return '';
    const x1 = src.x + NODE_WIDTH / 2;
    const y1 = src.y + NODE_HEIGHT;
    const x2 = tgt.x + NODE_WIDTH / 2;
    const y2 = tgt.y;
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };

  return (
    <div style={{ display: 'flex', height: 600, border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
      {/* Palette */}
      {!readOnly && (
        <div style={{ width: 140, borderRight: '1px solid #f0f0f0', padding: 12, background: '#fafafa' }}>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>节点面板</Text>
          {NODE_TYPES.map((nt) => (
            <div
              key={nt.type}
              draggable={!readOnly}
              onDragStart={(e) => handlePaletteDragStart(e, nt.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                marginBottom: 8,
                borderRadius: 6,
                border: `1px solid ${nt.color}`,
                background: '#fff',
                cursor: 'grab',
                color: nt.color,
                fontSize: 13,
              }}
            >
              {nt.icon} {nt.label}
            </div>
          ))}
          <Divider style={{ margin: '12px 0' }} />
          <Button size="small" block type={connectMode ? 'primary' : 'default'} onClick={() => { setConnectMode(!connectMode); setConnectSource(null); }}>
            {connectMode ? '退出连线' : '连线模式'}
          </Button>
          {connectMode && (
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              点击源节点，再点击目标节点建立连接
            </Text>
          )}
        </div>
      )}

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'auto', background: '#f6f8fa' }}>
        <div
          ref={canvasRef}
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
          onMouseDown={handleCanvasClick}
          style={{ width: '100%', height: '100%', minWidth: 800, minHeight: 600, position: 'relative' }}
        >
          {/* Grid background */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e8e8e8" strokeWidth={0.5} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Edges */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
            {edges.map((edge) => (
              <g key={edge.id}>
                <path d={getEdgePath(edge)} fill="none" stroke="#bfbfbf" strokeWidth={2} markerEnd="url(#arrow)" />
                {edge.label && (
                  <text
                    x={(() => {
                      const src = nodes.find((n) => n.id === edge.source);
                      const tgt = nodes.find((n) => n.id === edge.target);
                      if (!src || !tgt) return 0;
                      return (src.x + NODE_WIDTH / 2 + tgt.x + NODE_WIDTH / 2) / 2;
                    })()}
                    y={(() => {
                      const src = nodes.find((n) => n.id === edge.source);
                      const tgt = nodes.find((n) => n.id === edge.target);
                      if (!src || !tgt) return 0;
                      return (src.y + NODE_HEIGHT + tgt.y) / 2;
                    })()}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#666"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            ))}
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#bfbfbf" />
              </marker>
            </defs>
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const nt = NODE_TYPES.find((t) => t.type === node.type)!;
            const isSelected = selectedNodeId === node.id;
            const isConnectSource = connectSource === node.id;
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (connectMode) handleNodeClickForConnect(node.id);
                  else setSelectedNodeId(node.id);
                }}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                  background: '#fff',
                  border: `2px solid ${isSelected || isConnectSource ? nt.color : '#d9d9d9'}`,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: connectMode ? 'crosshair' : 'move',
                  zIndex: isSelected ? 10 : 2,
                  boxShadow: isSelected ? `0 0 0 2px ${nt.color}33` : '0 2px 4px rgba(0,0,0,0.06)',
                  userSelect: 'none',
                }}
              >
                <span style={{ color: nt.color }}>{nt.icon}</span>
                <Text strong style={{ fontSize: 13 }}>{node.name}</Text>
                {!readOnly && (
                  <Button
                    type="text"
                    size="small"
                    danger
                    style={{ position: 'absolute', top: -10, right: -10, width: 20, height: 20, padding: 0, minWidth: 20, display: isSelected ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}
                    onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                  >
                    ×
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Property Panel */}
      {selectedNode && !readOnly && (
        <div style={{ width: 320, borderLeft: '1px solid #f0f0f0', padding: 16, background: '#fff', overflow: 'auto' }}>
          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>节点属性</Text>
          <Form
            layout="vertical"
            key={selectedNode.id}
            initialValues={{
              name: selectedNode.name,
              ...selectedNode.config,
            }}
            onValuesChange={(_, all) => {
              const { name, ...config } = all;
              updateNodes(nodes.map((n) => (n.id === selectedNode.id ? { ...n, name, config } : n)));
            }}
          >
            <Form.Item name="name" label="节点名称">
              <Input placeholder="节点名称" />
            </Form.Item>

            {selectedNode.type === 'start' && (
              <Form.Item name="trigger" label="触发条件">
                <Select placeholder="选择触发方式">
                  <Option value="manual">手动发起</Option>
                  <Option value="auto">自动触发</Option>
                </Select>
              </Form.Item>
            )}

            {(selectedNode.type === 'approval') && (
              <>
                <Form.Item name="approverType" label="审批人类型">
                  <Select placeholder="选择审批人类型">
                    <Option value="user">指定用户</Option>
                    <Option value="role">指定角色</Option>
                    <Option value="superior">上级主管</Option>
                    <Option value="any">任意人员</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="approverRole" label="审批角色">
                  <Select placeholder="选择角色" allowClear>
                    <Option value="sample_receiver">样品接收员</Option>
                    <Option value="lab_manager">实验室主管</Option>
                    <Option value="analyst">检测员</Option>
                    <Option value="reviewer">复核员</Option>
                    <Option value="signatory">授权签字人</Option>
                    <Option value="quality_manager">质量负责人</Option>
                    <Option value="dept_manager">部门经理</Option>
                    <Option value="purchase_manager">采购主管</Option>
                    <Option value="compiler">编制人</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="approvalMode" label="审批方式">
                  <Select placeholder="选择审批方式">
                    <Option value="or">或签（单人通过）</Option>
                    <Option value="and">会签（全部通过）</Option>
                    <Option value="ratio">比例会签</Option>
                    <Option value="seq">顺序审批</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="timeoutHours" label="超时时间（小时）">
                  <Input type="number" placeholder="24" />
                </Form.Item>
                <Form.Item name="timeoutAction" label="超时处理">
                  <Select placeholder="选择超时处理策略">
                    <Option value="remind">提醒</Option>
                    <Option value="escalate">升级</Option>
                    <Option value="auto_approve">自动通过</Option>
                    <Option value="auto_reject">自动驳回</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {selectedNode.type === 'condition' && (
              <Form.Item name="expression" label="条件表达式">
                <TextArea rows={3} placeholder="如: amount > 5000" />
              </Form.Item>
            )}

            {selectedNode.type === 'countersign' && (
              <>
                <Form.Item name="approverType" label="审批人类型">
                  <Select placeholder="选择审批人类型">
                    <Option value="user">指定用户</Option>
                    <Option value="role">指定角色</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="approverRole" label="审批角色">
                  <Select placeholder="选择角色" allowClear>
                    <Option value="lab_manager">实验室主管</Option>
                    <Option value="reviewer">复核员</Option>
                    <Option value="quality_manager">质量负责人</Option>
                    <Option value="dept_manager">部门经理</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="passRatio" label="通过比例 (%)">
                  <Input type="number" placeholder="如: 80 表示超过80%通过" />
                </Form.Item>
                <Form.Item name="timeoutHours" label="超时时间（小时）">
                  <Input type="number" placeholder="24" />
                </Form.Item>
                <Form.Item name="timeoutAction" label="超时处理">
                  <Select placeholder="选择超时处理策略">
                    <Option value="remind">提醒</Option>
                    <Option value="escalate">升级</Option>
                    <Option value="auto_approve">自动通过</Option>
                    <Option value="auto_reject">自动驳回</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {selectedNode.type === 'parallel' && (
              <>
                <Form.Item name="parallelCount" label="并行分支数">
                  <Input type="number" placeholder="2" />
                </Form.Item>
                <Form.Item name="joinMode" label="汇聚模式">
                  <Select placeholder="选择汇聚模式">
                    <Option value="all">全部完成</Option>
                    <Option value="any">任一完成</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {selectedNode.type === 'delay' && (
              <>
                <Form.Item name="delayType" label="延时类型">
                  <Select placeholder="选择延时类型">
                    <Option value="fixed">固定时长</Option>
                    <Option value="cron">定时触发</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="delayValue" label="延时值">
                  <Input placeholder="如: 24h 或 0 9 * * *" />
                </Form.Item>
                <Form.Item name="autoAction" label="到期自动执行">
                  <Select placeholder="选择到期动作">
                    <Option value="pass">自动通过</Option>
                    <Option value="notify">仅通知</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {selectedNode.type === 'subprocess' && (
              <>
                <Form.Item name="subprocessId" label="子流程">
                  <Select placeholder="选择子流程">
                    <Option value="wf1">样品检测流程</Option>
                    <Option value="wf2">报告审核流程</Option>
                    <Option value="wf3">采购审批流程</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="inheritVars" label="继承变量">
                  <Select mode="multiple" placeholder="选择要继承的变量">
                    <Option value="sampleId">样品ID</Option>
                    <Option value="reportId">报告ID</Option>
                    <Option value="amount">金额</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {selectedNode.type === 'cc' && (
              <Form.Item name="recipients" label="接收人">
                <Select mode="multiple" placeholder="选择接收人">
                  <Option value="customer">客户</Option>
                  <Option value="archive_admin">档案管理员</Option>
                  <Option value="quality_manager">质量负责人</Option>
                  <Option value="lab_manager">实验室主管</Option>
                </Select>
              </Form.Item>
            )}

            <Divider />
            <Text strong style={{ display: 'block', marginBottom: 8 }}>流转规则</Text>
            {edges
              .filter((e) => e.source === selectedNode.id)
              .map((edge) => {
                const targetNode = nodes.find((n) => n.id === edge.target);
                return (
                  <div key={edge.id} style={{ marginBottom: 8, padding: 8, background: '#f6f8fa', borderRadius: 4 }}>
                    <Space>
                      <Text>→ {targetNode?.name || edge.target}</Text>
                      <Input
                        size="small"
                        placeholder="条件标签"
                        defaultValue={edge.label || ''}
                        style={{ width: 100 }}
                        onChange={(e) => {
                          updateEdges(edges.map((ed) => (ed.id === edge.id ? { ...ed, label: e.target.value } : ed)));
                        }}
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => updateEdges(edges.filter((ed) => ed.id !== edge.id))}
                      >
                        删除
                      </Button>
                    </Space>
                  </div>
                );
              })}
            {edges.filter((e) => e.source === selectedNode.id).length === 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>暂无出边连接</Text>
            )}
          </Form>
        </div>
      )}

      {selectedNode && readOnly && (
        <div style={{ width: 280, borderLeft: '1px solid #f0f0f0', padding: 16, background: '#fff' }}>
          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>节点信息</Text>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="名称">{selectedNode.name}</Descriptions.Item>
            <Descriptions.Item label="类型">{NODE_TYPES.find((t) => t.type === selectedNode.type)?.label}</Descriptions.Item>
            {selectedNode.config?.approverType && (
              <Descriptions.Item label="审批人">{selectedNode.config.approverRole || selectedNode.config.approverType}</Descriptions.Item>
            )}
            {selectedNode.config?.passRatio && (
              <Descriptions.Item label="通过比例">{selectedNode.config.passRatio}%</Descriptions.Item>
            )}
            {selectedNode.config?.expression && (
              <Descriptions.Item label="条件">{selectedNode.config.expression}</Descriptions.Item>
            )}
            {selectedNode.config?.delayType && (
              <Descriptions.Item label="延时">{selectedNode.config.delayValue}</Descriptions.Item>
            )}
            {selectedNode.config?.subprocessId && (
              <Descriptions.Item label="子流程">{selectedNode.config.subprocessId}</Descriptions.Item>
            )}
            {selectedNode.config?.parallelCount && (
              <Descriptions.Item label="并行数">{selectedNode.config.parallelCount}</Descriptions.Item>
            )}
          </Descriptions>
        </div>
      )}
    </div>
  );
};

// ===================== Main Page =====================
export const WorkflowPage: React.FC = () => {
  const [definitions, setDefinitions] = useState<WFDefinition[]>([]);
  const [instances, setInstances] = useState<WFInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  // Designer modal state
  const [designerOpen, setDesignerOpen] = useState(false);
  const [designingDef, setDesigningDef] = useState<WFDefinition | null>(null);
  const [designerNodes, setDesignerNodes] = useState<WFNode[]>([]);
  const [designerEdges, setDesignerEdges] = useState<WFEdge[]>([]);
  const [designerForm] = Form.useForm();

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Instance detail
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailInstance, setDetailInstance] = useState<WFInstance | null>(null);

  // Transfer modal
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferInstanceId, setTransferInstanceId] = useState<string | null>(null);
  const [transferForm] = Form.useForm();

  // Terminate modal
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminateInstanceId, setTerminateInstanceId] = useState<string | null>(null);
  const [terminateForm] = Form.useForm();

  const fetchDefinitions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(api('/workflow/definitions'));
      const json = await res.json();
      setDefinitions(json.data?.list || []);
    } catch {
      message.error('加载流程模板失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInstances = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(api('/workflow/instances'));
      const json = await res.json();
      setInstances(json.data?.list || []);
    } catch {
      message.error('加载流程实例失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDefinitions();
    fetchInstances();
  }, [fetchDefinitions, fetchInstances]);

  const handleCreate = async () => {
    const values = await createForm.validateFields();
    try {
      const res = await fetch(api('/workflow/definitions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          nodes: [{ id: genId('node'), type: 'start', name: '开始', x: 100, y: 80, config: {} }],
          edges: [],
        }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('流程模板创建成功');
        setCreateOpen(false);
        createForm.resetFields();
        fetchDefinitions();
      }
    } catch {
      message.error('创建失败');
    }
  };

  const handleSaveDesigner = async () => {
    if (!designingDef) return;
    const values = await designerForm.validateFields();
    try {
      const res = await fetch(api(`/workflow/definitions/${designingDef.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          nodes: designerNodes,
          edges: designerEdges,
        }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('流程设计已保存');
        setDesignerOpen(false);
        setDesigningDef(null);
        fetchDefinitions();
      }
    } catch {
      message.error('保存失败');
    }
  };

  const handleDeploy = async (id: string) => {
    try {
      const res = await fetch(api(`/workflow/definitions/${id}/deploy`), { method: 'POST' });
      const json = await res.json();
      if (json.code === 200) { message.success('部署成功'); fetchDefinitions(); }
    } catch { message.error('部署失败'); }
  };

  const handleUndeploy = async (id: string) => {
    try {
      const res = await fetch(api(`/workflow/definitions/${id}/undeploy`), { method: 'POST' });
      const json = await res.json();
      if (json.code === 200) { message.success('停用成功'); fetchDefinitions(); }
    } catch { message.error('停用失败'); }
  };

  const handleDeleteDef = async (id: string) => {
    try {
      const res = await fetch(api(`/workflow/definitions/${id}`), { method: 'DELETE' });
      const json = await res.json();
      if (json.code === 200) { message.success('删除成功'); fetchDefinitions(); }
    } catch { message.error('删除失败'); }
  };

  const handleUrge = async (id: string) => {
    try {
      const res = await fetch(api(`/workflow/instances/${id}/urge`), { method: 'POST' });
      const json = await res.json();
      if (json.code === 200) { message.success('催办通知已发送'); fetchInstances(); }
    } catch { message.error('催办失败'); }
  };

  const handleTransfer = async () => {
    if (!transferInstanceId) return;
    const values = await transferForm.validateFields();
    try {
      const res = await fetch(api(`/workflow/instances/${transferInstanceId}/transfer`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('转交成功');
        setTransferOpen(false);
        transferForm.resetFields();
        setTransferInstanceId(null);
        fetchInstances();
      }
    } catch { message.error('转交失败'); }
  };

  const handleTerminate = async () => {
    if (!terminateInstanceId) return;
    const values = await terminateForm.validateFields();
    try {
      const res = await fetch(api(`/workflow/instances/${terminateInstanceId}/terminate`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('流程已终止');
        setTerminateOpen(false);
        terminateForm.resetFields();
        setTerminateInstanceId(null);
        fetchInstances();
      }
    } catch { message.error('终止失败'); }
  };

  const openDesigner = (def: WFDefinition) => {
    setDesigningDef(def);
    setDesignerNodes(def.nodes || []);
    setDesignerEdges(def.edges || []);
    designerForm.setFieldsValue({
      name: def.name,
      type: def.type,
      description: def.description,
    });
    setDesignerOpen(true);
  };

  const openDetail = (inst: WFInstance) => {
    setDetailInstance(inst);
    setDetailOpen(true);
  };

  const runningCount = instances.filter((i) => i.status === 'running').length;
  const completedCount = instances.filter((i) => i.status === 'completed').length;
  const terminatedCount = instances.filter((i) => i.status === 'terminated').length;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <ApartmentOutlined /> 工作流引擎
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="流程模板" value={definitions.length} prefix={<ApartmentOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="运行中实例" value={runningCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="已完成" value={completedCount} valueStyle={{ color: '#1677ff' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="已终止" value={terminatedCount} valueStyle={{ color: '#ff4d4f' }} prefix={<StopOutlined />} />
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'templates',
            label: '流程模板',
            children: (
              <Card
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                    新建流程
                  </Button>
                }
              >
                <Table
                  dataSource={definitions}
                  rowKey="id"
                  loading={loading}
                  size="middle"
                  columns={[
                    { title: '流程名称', dataIndex: 'name', render: (n: string, r: WFDefinition) => <a onClick={() => openDesigner(r)}>{n}</a> },
                    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
                    { title: '节点数', dataIndex: 'nodes', render: (_: any, r: WFDefinition) => <Tag>{r.nodes?.length || 0} 个节点</Tag> },
                    { title: '版本', dataIndex: 'version' },
                    { title: '已使用次数', dataIndex: 'usedCount' },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      render: (s: WFStatus) => <Badge status={statusMap[s].color as any} text={statusMap[s].text} />,
                    },
                    {
                      title: '操作',
                      render: (_: any, r: WFDefinition) => (
                        <Space>
                          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openDesigner(r)}>
                            编辑
                          </Button>
                          {r.status === 'draft' && (
                            <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleDeploy(r.id)}>
                              部署
                            </Button>
                          )}
                          {r.status === 'deployed' && (
                            <Button type="link" size="small" icon={<PauseCircleOutlined />} onClick={() => handleUndeploy(r.id)}>
                              停用
                            </Button>
                          )}
                          <Popconfirm
                            title="确认删除？"
                            description="删除后不可恢复"
                            onConfirm={() => handleDeleteDef(r.id)}
                          >
                            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                              删除
                            </Button>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          {
            key: 'instances',
            label: '运行中实例',
            children: (
              <Card>
                <Table
                  dataSource={instances}
                  rowKey="id"
                  loading={loading}
                  size="middle"
                  columns={[
                    { title: '流程名称', dataIndex: 'defName' },
                    { title: '业务编号', dataIndex: 'businessId', render: (v: string) => <Tag>{v}</Tag> },
                    { title: '业务摘要', dataIndex: 'businessSummary' },
                    {
                      title: '当前步骤',
                      dataIndex: 'currentNodeNames',
                      render: (v: string[]) => v.map((n) => <Tag color="blue" key={n}>{n}</Tag>),
                    },
                    {
                      title: '处理人',
                      dataIndex: 'assignees',
                      render: (v: string[]) => v.join(', ') || '-',
                    },
                    { title: '开始时间', dataIndex: 'startedAt' },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      render: (s: InstStatus) => <Badge status={instStatusMap[s].color as any} text={instStatusMap[s].text} />,
                    },
                    {
                      title: '操作',
                      render: (_: any, r: WFInstance) => (
                        <Space>
                          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)}>
                            详情
                          </Button>
                          {r.status === 'running' && (
                            <>
                              <Button type="link" size="small" icon={<SendOutlined />} onClick={() => handleUrge(r.id)}>
                                催办
                              </Button>
                              <Button
                                type="link"
                                size="small"
                                icon={<SwapOutlined />}
                                onClick={() => { setTransferInstanceId(r.id); setTransferOpen(true); }}
                              >
                                转交
                              </Button>
                              <Button
                                type="link"
                                size="small"
                                danger
                                icon={<StopOutlined />}
                                onClick={() => { setTerminateInstanceId(r.id); setTerminateOpen(true); }}
                              >
                                终止
                              </Button>
                            </>
                          )}
                        </Space>
                      ),
                    },
                  ]}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Create Modal */}
      <Modal
        title="新建流程模板"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="name" label="流程名称" rules={[{ required: true }]}>
            <Input placeholder="如: 样品检测流程" />
          </Form.Item>
          <Form.Item name="type" label="流程类型" rules={[{ required: true }]}>
            <Select placeholder="选择类型">
              <Option value="检测">检测</Option>
              <Option value="报告">报告</Option>
              <Option value="采购">采购</Option>
              <Option value="质量">质量</Option>
              <Option value="通用">通用</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="流程描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Designer Modal */}
      <Modal
        title={designingDef ? `流程设计器 - ${designingDef.name}` : '流程设计器'}
        open={designerOpen}
        onOk={handleSaveDesigner}
        onCancel={() => { setDesignerOpen(false); setDesigningDef(null); }}
        width="90vw"
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Form form={designerForm} layout="inline">
            <Form.Item name="name" label="流程名称" rules={[{ required: true }]}>
              <Input placeholder="流程名称" />
            </Form.Item>
            <Form.Item name="type" label="类型" rules={[{ required: true }]}>
              <Select placeholder="类型" style={{ width: 120 }}>
                <Option value="检测">检测</Option>
                <Option value="报告">报告</Option>
                <Option value="采购">采购</Option>
                <Option value="质量">质量</Option>
                <Option value="通用">通用</Option>
              </Select>
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input placeholder="描述" style={{ width: 240 }} />
            </Form.Item>
          </Form>
        </div>
        <FlowDesigner
          value={{ nodes: designerNodes, edges: designerEdges }}
          onChange={({ nodes, edges }) => { setDesignerNodes(nodes); setDesignerEdges(edges); }}
        />
      </Modal>

      {/* Instance Detail Drawer */}
      <Drawer
        title="流程实例详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={560}
      >
        {detailInstance && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="流程名称">{detailInstance.defName}</Descriptions.Item>
              <Descriptions.Item label="业务编号">{detailInstance.businessId}</Descriptions.Item>
              <Descriptions.Item label="业务摘要">{detailInstance.businessSummary}</Descriptions.Item>
              <Descriptions.Item label="当前步骤">{detailInstance.currentNodeNames.join(', ')}</Descriptions.Item>
              <Descriptions.Item label="处理人">{detailInstance.assignees.join(', ') || '-'}</Descriptions.Item>
              <Descriptions.Item label="发起人">{detailInstance.startedBy}</Descriptions.Item>
              <Descriptions.Item label="开始时间">{detailInstance.startedAt}</Descriptions.Item>
              {detailInstance.completedAt && (
                <Descriptions.Item label="结束时间">{detailInstance.completedAt}</Descriptions.Item>
              )}
              <Descriptions.Item label="状态">
                <Badge status={instStatusMap[detailInstance.status].color as any} text={instStatusMap[detailInstance.status].text} />
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>流转历史</Text>
            <Timeline
              items={detailInstance.history.map((h) => ({
                color: h.action === 'terminated' ? 'red' : h.action === 'approved' ? 'green' : 'blue',
                children: (
                  <div>
                    <Text strong>{h.nodeName}</Text>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {h.operator} · {h.action === 'approved' ? '通过' : h.action === 'rejected' ? '驳回' : h.action === 'terminated' ? '终止' : h.action === 'transfer' ? '转交' : h.action === 'urge' ? '催办' : h.action}
                      {h.comment ? ` · ${h.comment}` : ''}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>{h.timestamp}</div>
                  </div>
                ),
              }))}
            />
            <Divider />
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>流程图</Text>
            <FlowDesigner
              value={{
                nodes: definitions.find((d) => d.id === detailInstance.defId)?.nodes || [],
                edges: definitions.find((d) => d.id === detailInstance.defId)?.edges || [],
              }}
              onChange={() => {}}
              readOnly
            />
          </>
        )}
      </Drawer>

      {/* Transfer Modal */}
      <Modal
        title="转交处理人"
        open={transferOpen}
        onOk={handleTransfer}
        onCancel={() => { setTransferOpen(false); transferForm.resetFields(); setTransferInstanceId(null); }}
      >
        <Form form={transferForm} layout="vertical">
          <Form.Item name="assignee" label="新处理人" rules={[{ required: true }]}>
            <Select placeholder="选择处理人">
              <Option value="张伟">张伟</Option>
              <Option value="李思">李思</Option>
              <Option value="王强">王强</Option>
              <Option value="李明">李明</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Terminate Modal */}
      <Modal
        title="终止流程"
        open={terminateOpen}
        onOk={handleTerminate}
        onCancel={() => { setTerminateOpen(false); terminateForm.resetFields(); setTerminateInstanceId(null); }}
      >
        <Form form={terminateForm} layout="vertical">
          <Form.Item name="reason" label="终止原因" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请输入终止原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
