import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, Tag, Spin, Divider, Avatar, List, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, BulbOutlined, BarChartOutlined, FileTextOutlined, ExperimentOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ChatMessage {
  id: string; role: 'user' | 'assistant'; content: string;
  timestamp: string; suggestions?: string[];
}

const quickQuestions = [
  { icon: <BarChartOutlined />, text: '本周有哪些不合格样品？' },
  { icon: <FileTextOutlined />, text: '生成上周报告统计' },
  { icon: <ExperimentOutlined />, text: '质控趋势分析' },
  { icon: <ThunderboltOutlined />, text: '预测检测周期时间' },
];

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: '您好！我是HC-LIMS智能助手。我可以帮您查询样品状态、分析质控数据、生成报告建议等。请问有什么可以帮您？',
      timestamp: new Date().toISOString(), suggestions: ['本周有哪些不合格样品？', '查看质控趋势', '预测检测周期'] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: 'u' + Date.now(), role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]); setInput(''); setLoading(true);
    try {
      const res = await fetch('/api/v1/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      if (data.code === 200) {
        setMessages(prev => [...prev, { id: 'a' + Date.now(), role: 'assistant', content: data.data.reply,
          timestamp: new Date().toISOString(), suggestions: data.data.suggestions }]);
      } else { message.error(data.message || 'AI服务异常'); }
    } catch { message.error('网络错误，请重试'); } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card title={<Space><RobotOutlined style={{ fontSize: 20, color: '#722ed1' }} /><Title level={4} style={{ margin: 0 }}>AI 智能助手</Title></Space>} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 24px', background: '#f6f8fa', borderBottom: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}><BulbOutlined /> 您可以这样问我：</Text>
          <Space wrap>
            {quickQuestions.map((q, i) => (
              <Tag key={i} icon={q.icon} style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }} onClick={() => sendMessage(q.text)}>{q.text}</Tag>
            ))}
          </Space>
        </div>
        <div style={{ height: 480, overflowY: 'auto', padding: '16px 24px', background: '#fafafa' }}>
          <List dataSource={messages} renderItem={msg => (
            <List.Item style={{ border: 'none', padding: '8px 0' }}>
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <Avatar icon={msg.role === 'assistant' ? <RobotOutlined /> : <UserOutlined />} style={{ background: msg.role === 'assistant' ? '#722ed1' : '#1677ff', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 13 }}>{msg.role === 'assistant' ? 'HC-LIMS AI助手' : '您'}</Text>
                  <div style={{ marginTop: 4, lineHeight: 1.6 }}><Text style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text></div>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <Space wrap style={{ marginTop: 8 }}>
                      {msg.suggestions.map((s, i) => <Tag key={i} color="purple" style={{ cursor: 'pointer' }} onClick={() => sendMessage(s)}>{s}</Tag>)}
                    </Space>
                  )}
                </div>
              </div>
            </List.Item>
          )} />
          {loading && <div style={{ display: 'flex', gap: 12, padding: '8px 0' }}><Avatar icon={<RobotOutlined />} style={{ background: '#722ed1' }} /><Spin size="small" tip="思考中..." /></div>}
          <div ref={messagesEndRef} />
        </div>
        <Divider style={{ margin: 0 }} />
        <div style={{ padding: '16px 24px', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <TextArea value={input} onChange={e => setInput(e.target.value)} onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="输入您的问题，按Enter发送..." autoSize={{ minRows: 1, maxRows: 4 }} style={{ flex: 1 }} />
          <Button type="primary" icon={<SendOutlined />} onClick={() => sendMessage(input)} loading={loading} style={{ background: '#722ed1', borderColor: '#722ed1' }}>发送</Button>
        </div>
      </Card>
    </div>
  );
};
