import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, Tabs, Drawer, Descriptions, Timeline, Badge, Modal, Form, message } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const certColors: Record<string, string> = { active: '#52c41a', warning: '#faad14', expired: '#ff4d4f' };
const certLabels: Record<string, string> = { active: '正常', warning: '即将过期', expired: '已过期' };
const roleColors: Record<string, string> = { PI: '#ff4d4f', 博士后: '#1677ff', 博士生: '#52c41a', 硕士生: '#faad14', 检测员: '#1677ff', 仪器管理员: '#722ed1', 质量主管: '#eb2f96', 报告审核员: '#13c2c2' };

export const PersonnelPage: React.FC = () => {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [pr, tr, cr] = await Promise.all([
      fetch('/api/v1/personnel').then(r => r.json()),
      fetch('/api/v1/personnel/training').then(r => r.json()),
      fetch('/api/v1/personnel/certificates').then(r => r.json()),
    ]);
    setPersonnel(pr.data.list); setTrainings(tr.data.list); setCerts(cr.data.list); setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = personnel.filter((p: any) => p.name.includes(search) || p.dept.includes(search) || p.position.includes(search));
  const stats = { total: personnel.length, active: personnel.filter((p: any) => p.certStatus === 'active').length, warning: personnel.filter((p: any) => p.certStatus === 'warning').length, expired: personnel.filter((p: any) => p.certStatus === 'expired').length };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>人员与培训</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={6}><Card size="small"><Statistic title="总人数" value={stats.total} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="在岗" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="资质到期预警" value={stats.warning} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="已过期" value={stats.expired} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>
      <Tabs defaultActiveKey="personnel" items={[
        { key: 'personnel', label: '人员档案', children: (
          <Card><Space style={{ marginBottom: 16 }}>
            <Input placeholder="搜索姓名/部门/岗位" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
            <Select placeholder="资质状态" style={{ width: 130 }} allowClear>
              {Object.entries(certColors).map(([k, v]) => <Select.Option key={k} value={k}><Badge color={v} />{certLabels[k]}</Select.Option>)}
            </Select>
          </Space>
          <Table dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
            { title: '姓名', dataIndex: 'name', render: (n: string, r: any) => <a onClick={() => { setSelected(r); setDrawer(true); }}>{n}</a> },
            { title: '工号', dataIndex: 'empNo', render: (e: string) => <Text code>{e}</Text> },
            { title: '部门', dataIndex: 'dept' },
            { title: '岗位', dataIndex: 'position' },
            { title: '角色', dataIndex: 'role', render: (r: string) => <Tag color={roleColors[r] || '#1677ff'}>{r}</Tag> },
            { title: '实验室', dataIndex: 'lab' },
            { title: '入职日期', dataIndex: 'joinDate' },
            { title: '资质状态', dataIndex: 'certStatus', render: (s: string) => <Tag color={certColors[s]}>{certLabels[s]}</Tag> },
            { title: '操作', render: (_: any, r: any) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawer(true); }} /> },
          ]} size="middle" /></Card>
        )},
        { key: 'training', label: '培训管理', children: (
          <Card><Table dataSource={trainings} rowKey="id" columns={[
            { title: '培训名称', dataIndex: 'name' },
            { title: '培训对象', dataIndex: 'target' },
            { title: '部门', dataIndex: 'dept' },
            { title: '计划日期', dataIndex: 'planDate' },
            { title: '实际日期', dataIndex: 'actualDate' },
            { title: '参与人数', dataIndex: 'participants', render: (p: number) => p || '-' },
            { title: '通过率', dataIndex: 'passRate', render: (r: number) => r ? `${r}%` : '-' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s==='completed'?'green':s==='in_progress'?'blue':'default'}>{s==='completed'?'已完成':s==='in_progress'?'进行中':'已计划'}</Tag> },
          ]} pagination={false} size="middle" /></Card>
        )},
        { key: 'certificates', label: '资质管理', children: (
          <Row gutter={16}>
            <Col span={16}><Card title="资质证书台账">
              <Table dataSource={certs} rowKey="id" pagination={false} size="small" columns={[
                { title: '证书编号', dataIndex: 'no', render: (n: string) => <Text code>{n}</Text> },
                { title: '持证人', dataIndex: 'holder' },
                { title: '证书类型', dataIndex: 'type' },
                { title: '发证机构', dataIndex: 'issuer' },
                { title: '有效期', dataIndex: 'expiryDate', render: (d: string) => <Text type={new Date(d) < new Date() ? 'danger' : undefined}>{d}</Text> },
                { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s==='active'?'success':s==='expiring'?'warning':'error'} text={s==='active'?'有效':s==='expiring'?'即将过期':'已过期'} /> },
              ]} /></Card>
            </Col>
            <Col span={8}>
              <Card title="到期预警面板">
                {certs.filter(c => c.status !== 'active').map(c => <Card key={c.id} size="small" style={{ marginBottom: 8 }}>
                  <Text strong>{c.holder}</Text><br />
                  <Text type="secondary">{c.type}</Text><br />
                  <Text type="danger">到期: {c.expiryDate}</Text>
                </Card>)}
                {certs.filter(c => c.status === 'active').length === certs.length && <Text type="secondary">暂无到期预警</Text>}
              </Card>
            </Col>
          </Row>
        )},
      ]} />

      <Drawer title={selected?.name} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={480}>
        {selected && (<>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="姓名">{selected.name}</Descriptions.Item>
            <Descriptions.Item label="工号">{selected.empNo}</Descriptions.Item>
            <Descriptions.Item label="部门">{selected.dept}</Descriptions.Item>
            <Descriptions.Item label="岗位">{selected.position}</Descriptions.Item>
            <Descriptions.Item label="角色"><Tag color={roleColors[selected.role]}>{selected.role}</Tag></Descriptions.Item>
            <Descriptions.Item label="实验室">{selected.lab}</Descriptions.Item>
            <Descriptions.Item label="入职日期">{selected.joinDate}</Descriptions.Item>
            <Descriptions.Item label="资质状态"><Tag color={certColors[selected.certStatus]}>{certLabels[selected.certStatus]}</Tag></Descriptions.Item>
          </Descriptions>
          <Tabs style={{ marginTop: 16 }} items={[
            { key: 'certs', label: '资质证书', children: <Table dataSource={certs.filter(c => c.holder === selected.name)} rowKey="id" pagination={false} size="small" columns={[{title:'证书',dataIndex:'type'},{title:'有效期',dataIndex:'expiryDate'},{title:'状态',dataIndex:'status',render:(s:string)=> <Badge status={s==='active'?'success':'error'} />}]} /> },
            { key: 'training', label: '培训记录', children: <Timeline items={trainings.filter(t => t.dept === selected.dept || t.dept === '全部').map(t => ({ color: t.status === 'completed' ? 'green' : 'blue', children: <>{t.name}<br /><Text type="secondary">{t.actualDate || t.planDate}</Text></> }))} /> },
          ]} />
        </>)}
      </Drawer>
    </div>
  );
};
