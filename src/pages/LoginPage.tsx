import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Space, Select, message, Divider, Tag } from 'antd';
import { UserOutlined, LockOutlined, ExperimentOutlined, TeamOutlined, SafetyCertificateOutlined, AuditOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const systemRoles = [
  { value: 'analyst', label: '🔬 检测员', desc: '任务执行 · 结果录入 · ELN记录' },
  { value: 'reviewer', label: '✅ 审核人', desc: '数据审核 · 报告审核 · 技术把关' },
  { value: 'signer', label: '✍️ 授权签字人', desc: '报告签发 · 电子签名 · 终审' },
  { value: 'qa', label: '📋 QA主管', desc: '质量控制 · 偏差管理 · CAPA跟踪' },
  { value: 'manager', label: '👔 实验室主管', desc: '任务分配 · 人员管理 · 看板监控' },
  { value: 'admin', label: '⚙️ 系统管理员', desc: '系统配置 · 权限管理 · 模板设计' },
];

const clientRoles = [
  { value: 'customer', label: '🏢 委托客户', desc: '在线委托 · 进度查询 · 报告下载' },
];

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'system' | 'client'>('system');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string; role: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, loginType }),
      });
      const data = await res.json();
      if (data.code === 200) {
        message.success(`登录成功 — ${loginType === 'client' ? '客户门户' : 'LIMS系统'}`);
        navigate(loginType === 'client' ? '/portal' : '/dashboard');
      } else {
        message.error(data.message || '登录失败');
      }
    } catch {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', position: 'relative',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 40%, #0d2137 100%)',
      overflow: 'hidden',
    }}>
      {/* Background scene — lab equipment silhouettes */}
      <svg style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'60%', opacity:0.08 }} viewBox="0 0 1200 400">
        <rect x={50} y={100} width={80} height={200} rx={8} fill="#fff"/>
        <rect x={55} y={110} width={70} height={40} rx={4} fill="#1677ff" opacity={0.3}/>
        <rect x={55} y={160} width={70} height={60} rx={4} fill="#52c41a" opacity={0.3}/>
        <circle cx={90} cy={180} r={15} fill="none" stroke="#52c41a" strokeWidth={2}/>
        <rect x={200} y={80} width={60} height={220} rx={6} fill="#fff"/>
        <rect x={210} y={100} width={40} height={15} rx={2} fill="#fa8c16" opacity={0.3}/>
        <rect x={210} y={125} width={40} height={15} rx={2} fill="#fa8c16" opacity={0.3}/>
        <rect x={210} y={150} width={40} height={15} rx={2} fill="#fa8c16" opacity={0.3}/>
        <line x1={230} y1={80} x2={230} y2={50} stroke="#fff" strokeWidth={2}/>
        <circle cx={230} cy={45} r={8} fill="#fa8c16"/>
        <rect x={350} y={120} width={100} height={160} rx={8} fill="#fff"/>
        <rect x={360} y={140} width={80} height={4} rx={2} fill="#1677ff" opacity={0.2}/>
        <rect x={360} y={155} width={60} height={4} rx={2} fill="#1677ff" opacity={0.2}/>
        <rect x={360} y={170} width={90} height={4} rx={2} fill="#1677ff" opacity={0.2}/>
        <rect x={360} y={200} width={40} height={40} rx={4} fill="#722ed1" opacity={0.2}/>
        <rect x={520} y={90} width={70} height={210} rx={6} fill="#fff"/>
        <circle cx={555} cy={130} r={20} fill="none" stroke="#1677ff" strokeWidth={3}/>
        <text x={555} y={135} fontSize={10} fill="#1677ff" textAnchor="middle">HPLC</text>
        <rect x={700} y={60} width={120} height={50} rx={6} fill="#fff" opacity={0.5}/>
        <rect x={710} y={70} width={30} height={30} rx={4} fill="#52c41a" opacity={0.2}/>
        <rect x={750} y={70} width={30} height={30} rx={4} fill="#1677ff" opacity={0.2}/>
        <rect x={790} y={70} width={25} height={30} rx={4} fill="#fa8c16" opacity={0.2}/>
        <rect x={700} y={120} width={120} height={80} rx={6} fill="#fff" opacity={0.5}/>
        <line x1={760} y1={130} x2={760} y2={190} stroke="#d9d9d9" strokeWidth={1}/>
        <circle cx={740} cy={145} r={4} fill="#52c41a"/>
        <circle cx={760} cy={160} r={4} fill="#1677ff"/>
        <circle cx={780} cy={150} r={4} fill="#fa8c16"/>
        {/* Grid pattern */}
        {Array.from({length:20}).map((_,i) => <line key={i} x1={i*60} y1={0} x2={i*60} y2={400} stroke="#fff" strokeWidth={0.3} opacity={0.3}/>)}
        {Array.from({length:8}).map((_,i) => <line key={'h'+i} x1={0} y1={i*50} x2={1200} y2={i*50} stroke="#fff" strokeWidth={0.3} opacity={0.3}/>)}
      </svg>

      {/* Left panel — branding */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', color:'#fff' }}>
          <div style={{ width:80,height:80,borderRadius:20,background:'rgba(255,255,255,0.15)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:24,backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,0.2)' }}>
            <ExperimentOutlined style={{ fontSize:40, color:'#fff' }} />
          </div>
          <Title level={1} style={{ color:'#fff', margin:0, letterSpacing:8, fontWeight:300 }}>红创 LIMS</Title>
          <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:18, letterSpacing:4 }}>实验室信息管理系统</Text>
          <Divider style={{ borderColor:'rgba(255,255,255,0.15)', margin:'24px 0' }} />
          <Space direction="vertical" size={8} style={{ textAlign:'left' }}>
            <Text style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}><SafetyCertificateOutlined style={{marginRight:8}}/>CNAS/CMA 合规检测流程</Text>
            <Text style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}><ExperimentOutlined style={{marginRight:8}}/>从委托到报告的完整闭环</Text>
            <Text style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}><AuditOutlined style={{marginRight:8}}/>电子签名 · 审计追踪 · 数据完整性</Text>
          </Space>
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{ width:480, display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 48px',position:'relative',zIndex:1 }}>
        <Card style={{ borderRadius:16, boxShadow:'0 16px 48px rgba(0,0,0,0.3)', background:'rgba(255,255,255,0.97)' }} bodyStyle={{ padding:'40px 32px' }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <Title level={4} style={{ margin:0 }}>欢迎登录</Title>
            <div style={{ marginTop:12 }}>
              <Button type={loginType === 'system' ? 'primary' : 'default'} onClick={() => { setLoginType('system'); form.setFieldValue('role', 'analyst'); }} style={{ borderRadius:'8px 0 0 8px' }}>LIMS 系统</Button>
              <Button type={loginType === 'client' ? 'primary' : 'default'} onClick={() => { setLoginType('client'); form.setFieldValue('role', 'customer'); }} style={{ borderRadius:'0 8px 8px 0' }}>客户门户</Button>
            </div>
          </div>

          <Form form={form} size="large" onFinish={handleSubmit} autoComplete="off" initialValues={{ role: 'analyst' }}>
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined />} placeholder={loginType === 'client' ? '客户账号 / 手机号' : '用户名'} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Form.Item name="role" rules={[{ required: true }]}>
              <Select placeholder="选择角色">
                {(loginType === 'client' ? clientRoles : systemRoles).map(r => (
                  <Select.Option key={r.value} value={r.value}>
                    <div><Text strong>{r.label}</Text><br/><Text type="secondary" style={{fontSize:11}}>{r.desc}</Text></div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" block loading={loading} size="large">
                {loginType === 'client' ? '进入客户门户' : '登 录'}
              </Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign:'center', marginTop:12 }}>
            <Text type="secondary" style={{ fontSize:12 }}>测试账号: admin / admin123</Text>
          </div>
        </Card>
        <Text style={{ textAlign:'center',display:'block',marginTop:16,color:'rgba(255,255,255,0.5)',fontSize:12 }}>
          © 2026 红创检测认证有限公司
        </Text>
      </div>
    </div>
  );
};
