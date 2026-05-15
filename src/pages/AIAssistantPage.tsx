import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, Tag, List, Divider, Select, message, Spin, Badge, Collapse } from 'antd';
import { RobotOutlined, SendOutlined, UserOutlined, BulbOutlined, ExperimentOutlined, SafetyOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'qa' | 'analysis' | 'alert';
}

const suggestions = [
  { icon: <BulbOutlined />, text: '分析本月质控数据趋势', type: 'analysis' },
  { icon: <ExperimentOutlined />, text: '推荐样品前处理方法', type: 'qa' },
  { icon: <SafetyOutlined />, text: '评估实验室风险等级', type: 'alert' },
  { icon: <BarChartOutlined />, text: '生成月度管理工作总结', type: 'analysis' },
];

const mockResponses: Record<string, string> = {
  '分析本月质控数据趋势': `## 本月质控数据分析

**整体评估**: ✅ 受控

| 指标 | 数值 | 评价 |
|------|------|------|
| 质控样品总数 | 128个 | 正常 |
| 超出警告限(2σ) | 3次 (2.3%) | <5%阈值 ✅ |
| 超出行动限(3σ) | 0次 | ✅ |
| Westgard违规 | 1次 (1₂s) | 已调查 |

**趋势分析**:
- 铅(Pb)连续7天呈上升趋势，建议检查标准溶液
- 微生物检测稳定性良好，CV<5%
- 建议关注 HPLC #2 基线漂移问题

**行动建议**: 
1. 重新配制Pb标准溶液
2. 安排HPLC #2预防性维护`,
  '推荐样品前处理方法': `## 智能推荐

根据样品类型「地表水」和检测项目「重金属(Pb/Cd/Hg/As)」，推荐:

1. **前处理方法**: 硝酸+过氧化氢微波消解 (EPA 3015A)
2. **检测仪器**: ICP-MS Agilent 7800
3. **质控方案**: 
   - 空白样 ×1
   - 加标回收 ×1 (浓度: 10μg/L)
   - 标准参考物质: SRM 1640a
4. **预计时间**: 样品前处理 45min + 检测 15min/样品
5. **注意事项**: 避免使用玻璃容器(可能引入Pb污染)，建议使用PFA容器`,
};

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: '您好！我是 **红创 LIMS 智能助手** 🧪\n\n我可以帮您:\n- 📊 分析质控数据和趋势\n- 🧪 推荐检测方法和前处理方案\n- ⚠️ 评估风险和发出预警\n- 📝 生成报告和总结\n\n请随时向我提问！', timestamp: new Date().toLocaleTimeString(), type: 'qa' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Simulate AI response
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));
    const response = mockResponses[query] || generateResponse(query);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Card
          title={<Space><RobotOutlined style={{ color: '#1677ff' }} /><span>AI 智能助手</span></Space>}
          extra={<Tag color="green">在线</Tag>}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          bodyStyle={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ flex: 1, overflow: 'auto', marginBottom: 12 }}>
            {messages.map(m => (
              <div key={m.id} style={{ marginBottom: 16, display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.role === 'user' ? '#1677ff' : '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.role === 'user' ? <UserOutlined style={{ color: '#fff' }} /> : <RobotOutlined style={{ color: '#fff' }} />}
                </div>
                <div style={{ maxWidth: '75%', background: m.role === 'user' ? '#1677ff' : '#f5f5f5', color: m.role === 'user' ? '#fff' : '#333', borderRadius: 12, padding: '10px 14px', lineHeight: 1.6 }}>
                  <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>').replace(/\|(.+)\|/g, (match) => `<code>${match}</code>`) }} />
                  <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6, textAlign: m.role === 'user' ? 'right' : 'left' }}>{m.timestamp}</div>
                </div>
              </div>
            ))}
            {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RobotOutlined style={{ color: '#fff' }} />
              </div>
              <Spin size="small" /> <Text type="secondary">AI 正在分析...</Text>
            </div>}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
            <TextArea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="输入您的问题..." autoSize={{ minRows: 1, maxRows: 4 }} style={{ flex: 1 }} />
            <Button type="primary" icon={<SendOutlined />} onClick={() => handleSend()} loading={loading}>发送</Button>
          </div>
        </Card>
      </div>
      <div style={{ width: 280, flexShrink: 0 }}>
        <Card title="推荐问题" size="small" style={{ marginBottom: 12 }}>
          {suggestions.map((s, i) => (
            <Button key={i} type="text" block icon={s.icon} style={{ textAlign: 'left', marginBottom: 4, height: 'auto', padding: '6px 8px' }} onClick={() => handleSend(s.text)}>
              <Text style={{ fontSize: 13 }}>{s.text}</Text>
            </Button>
          ))}
        </Card>
        <Card title="分析历史" size="small">
          <List size="small" dataSource={[
            { title: '上月质控报告分析', time: '2024-05-01', type: 'analysis' },
            { title: '仪器利用率优化建议', time: '2024-04-25', type: 'analysis' },
            { title: '检测方法偏离评估', time: '2024-04-18', type: 'alert' },
          ]} renderItem={item => (
            <List.Item style={{ cursor: 'pointer', padding: '6px 0' }}>
              <div>
                <Text style={{ fontSize: 12 }}>{item.title}</Text>
                <br /><Text type="secondary" style={{ fontSize: 11 }}>{item.time}</Text>
              </div>
            </List.Item>
          )} />
        </Card>
      </div>
    </div>
  );
};

function generateResponse(query: string): string {
  if (query.includes('风险') || query.includes('安全')) {
    return `## 实验室风险评估

根据当前数据分析:

**风险等级**: 🟡 中等风险

| 风险项 | 等级 | 详情 |
|--------|------|------|
| 仪器故障风险 | 🟡 中 | HPLC #2 基线漂移 |
| 质控失控风险 | 🟢 低 | 所有项目Westgard通过 |
| 人员短缺风险 | 🟡 中 | 下月2人培训 |
| 试剂过期风险 | 🟢 低 | 未来30天无过期 |

**建议**: 优先处理HPLC #2维护，安排人员备份计划。`;
  }
  if (query.includes('报告') || query.includes('统计') || query.includes('总结')) {
    return `## 月度工作摘要 (2024年5月)

**核心指标**:
- 📋 完成样品检测: 1,245 个 (+12% vs上月)
- 📄 签发报告: 1,180 份
- ⏱️ 平均TAT(周转时间): 3.2天
- ✅ 客户满意度: 98.5%
- ⚠️ 偏差事件: 2起(均已关闭)

**关键发现**: 样品量增长主要来自食品检测业务(+25%)，建议考虑增加该领域人员配置。`;
  }
  return `感谢您的提问！基于当前系统数据分析：

${query.includes('方法') ? '建议参考实验室方法库中的标准操作流程(SOP)，或查看方法验证报告以获取详细参数配置。' :
   query.includes('仪器') ? '仪器状态概览：HPLC #1正常运行，GC-MS #2需校准(下次校准日期: 2024-06-15)，ICP-MS运行良好。' :
   query.includes('样品') ? '本月样品统计：共登记1,245个样品，其中水质检测占比45%、食品检测30%、环境检测25%。' :
   '我理解您的问题，请您提供更详细的信息，或者从左侧推荐问题中选择一个来开始分析。'}`;
}
