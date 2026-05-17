import React, { useEffect, useRef, useState } from 'react';
import {
  Card, Input, Button, List, Tag, Space, Typography, Spin, Empty,
  Row, Col, message, Tooltip, Divider,
} from 'antd';
import {
  SendOutlined, RobotOutlined, UserOutlined, BulbOutlined,
  DeleteOutlined, ClockCircleOutlined,
} from '@ant-design/icons';


const { Title, Text } = Typography;
const { TextArea } = Input;

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'table' | 'chart';
  data?: any;
  timestamp: string;
}

interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

const quickQuestions = [
  '本月样品检测量统计',
  '哪些仪器利用率低于50%？',
  '最近7天有哪些异常质控结果？',
  '生成本月工作报告摘要',
  'COD检测合格率趋势',
  '哪些客户样品量最大？',
];

export const AIAssistantPage: React.FC = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    fetch('/api/v1/ai/conversations')
      .then(r => r.json())
      .then(res => {
        if (res.code === 200) {
          setConversations(res.data.list);
          if (res.data.list.length > 0) {
            setActiveConvId(res.data.list[0].id);
          }
        }
      })
      .catch(() => message.error('加载对话失败'));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [activeConv?.messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = text || inputValue.trim();
    if (!content) return;
    setInputValue('');
    setLoading(true);

    const userMsg: AIMessage = {
      id: 'um' + Date.now(),
      role: 'user',
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => {
      if (activeConvId) {
        return prev.map(c => c.id === activeConvId
          ? { ...c, messages: [...c.messages, userMsg], updatedAt: new Date().toISOString() }
          : c
        );
      }
      const newConv: AIConversation = {
        id: 'conv' + Date.now(),
        title: content.slice(0, 20),
        messages: [userMsg],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActiveConvId(newConv.id);
      return [newConv, ...prev];
    });

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConvId, message: content }),
      });
      const data = await res.json();
      if (data.code === 200) {
        const assistantMsg: AIMessage = {
          id: data.data.messageId,
          role: 'assistant',
          content: data.data.content,
          type: data.data.type || 'text',
          data: data.data.data,
          timestamp: new Date().toISOString(),
        };
        setConversations(prev => prev.map(c =>
          c.id === (activeConvId || prev[0]?.id)
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        ));
      }
    } catch {
      message.error('AI 回复失败');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = (id: string) => {
    fetch(`/api/v1/ai/conversations/${id}`, { method: 'DELETE' })
      .then(() => {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConvId === id) {
          const remaining = conversations.filter(c => c.id !== id);
          setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
        }
        message.success('对话已删除');
      })
      .catch(() => message.error('删除失败'));
  };

  const renderMessage = (msg: AIMessage) => {
    const isUser = msg.role === 'user';
    return (
      <div key={msg.id} style={{ display: 'flex', gap: 12, marginBottom: 16, flexDirection: isUser ? 'row-reverse' : 'row' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isUser ? '#1677ff' : '#f0f0f0', color: isUser ? '#fff' : '#666', flexShrink: 0,
        }}>
          {isUser ? <UserOutlined /> : <RobotOutlined />}
        </div>
        <div style={{
          maxWidth: '70%',
          background: isUser ? '#1677ff' : '#f6f6f6',
          color: isUser ? '#fff' : '#333',
          padding: '12px 16px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: 14,
          lineHeight: 1.6,
        }}>
          {msg.type === 'table' && msg.data ? (
            <div>
              <div style={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              <TableRenderer data={msg.data} />
            </div>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          )}
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6, textAlign: 'right' }}>
            {msg.timestamp.slice(11, 16)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <RobotOutlined style={{ marginRight: 8 }} />
        AI 数据分析助手
      </Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Card
            title="对话历史"
            extra={
              <Button type="primary" size="small" onClick={() => { setActiveConvId(null); }}>
                新对话
              </Button>
            }
            styles={{ body: { padding: 8, maxHeight: 600, overflow: 'auto' } }}
          >
            <List
              dataSource={conversations}
              renderItem={item => (
                <List.Item
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: 6,
                    background: activeConvId === item.id ? '#e6f4ff' : 'transparent',
                  }}
                  onClick={() => setActiveConvId(item.id)}
                  actions={[
                    <Tooltip title="删除" key="del">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }}
                      />
                    </Tooltip>,
                  ]}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <Text strong style={{ display: 'block', fontSize: 13 }} ellipsis>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {item.updatedAt?.slice(0, 10)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={18}>
          <Card
            styles={{ body: { padding: 16, height: 560, display: 'flex', flexDirection: 'column' } }}
          >
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
              {!activeConv || activeConv.messages.length === 0 ? (
                <Empty
                  image={<RobotOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
                  description="开始一个新的对话，或从左侧选择历史记录"
                >
                  <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
                    <Text type="secondary"><BulbOutlined /> 快捷问题</Text>
                    <Space wrap>
                      {quickQuestions.map(q => (
                        <Tag
                          key={q}
                          color="blue"
                          style={{ cursor: 'pointer' }}
                          onClick={() => sendMessage(q)}
                        >
                          {q}
                        </Tag>
                      ))}
                    </Space>
                  </Space>
                </Empty>
              ) : (
                activeConv.messages.map(renderMessage)
              )}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                    <RobotOutlined />
                  </div>
                  <Spin size="small" />
                  <Text type="secondary" style={{ fontSize: 13 }}>AI 思考中...</Text>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="输入您的问题，例如：本月 COD 检测合格率是多少？"
                autoSize={{ minRows: 1, maxRows: 4 }}
                onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => sendMessage()}
                loading={loading}
                disabled={!inputValue.trim()}
              >
                发送
              </Button>
            </Space.Compact>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const TableRenderer: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ overflowX: 'auto', marginTop: 8 }}>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            {Object.keys(data[0]).map(key => (
              <th key={key} style={{ padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'left', fontWeight: 600 }}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val: any, j) => (
                <td key={j} style={{ padding: '8px 12px', border: '1px solid #f0f0f0' }}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AIAssistantPage;
