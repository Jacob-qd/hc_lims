import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Tree, Tabs, Descriptions, Drawer, Badge, Progress, Modal, Form, message, Select } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined, TeamOutlined, FundOutlined, ToolOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Member {
  id: string; name: string; role: string; education: string; field: string; joinDate: string; status: string;
}

interface BudgetItem {
  id: string; source: string; type: string; amount: number; used: number; remain: number; description?: string;
}

interface ResearchGroup {
  id: string; name: string; dept: string; pi: string; members: number; budget: string; projects: number; instrumentUsage: number; status: string; field: string;
}

const roleColors: Record<string, string> = { PI: '#ff4d4f', 博士后: '#1677ff', 博士生: '#52c41a', 硕士生: '#faad14', 科研助理: '#d9d9d9', 本科生: '#722ed1' };
const typeColors: Record<string, string> = { 纵向: 'blue', 横向: 'orange', 校内: 'default' };

const GroupDetail: React.FC<{ group: ResearchGroup | null; visible: boolean; onClose: () => void }> = ({ group, visible, onClose }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setLoading(true);
      fetch(`/api/v1/research/groups/${group.id}/members`).then(r => r.json()).then(d => { setMembers(d.data?.list || []); });
      fetch(`/api/v1/research/groups/${group.id}/budget`).then(r => r.json()).then(d => { setBudget(d.data?.list || []); }).finally(() => setLoading(false));
    }
  }, [group]);

  if (!group) return null;
  return (
    <Drawer title={`${group.name} - 详情`} open={visible} onClose={onClose} width={680}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="在组人数" value={group.members} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="在研项目" value={group.projects} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="本月使用" value={group.instrumentUsage} suffix="次" /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="经费余额" value={group.budget} valueStyle={{ fontSize: 14 }} /></Card></Col>
      </Row>
      <Tabs defaultActiveKey="members" items={[
        { key: 'members', label: '成员管理', children: (
          <Table dataSource={members} rowKey="id" loading={loading} pagination={false} size="small" columns={[
            { title: '姓名', dataIndex: 'name' },
            { title: '角色', dataIndex: 'role', render: (r: string) => <Tag color={roleColors[r]}>{r}</Tag> },
            { title: '学历', dataIndex: 'education' },
            { title: '研究方向', dataIndex: 'field' },
            { title: '加入日期', dataIndex: 'joinDate' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s==='active'?'success':'default'} text={s==='active'?'在组':'已离组'} /> },
          ]} />
        )},
        { key: 'info', label: '基本信息', children: (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="课题组名称" span={2}>{group.name}</Descriptions.Item>
            <Descriptions.Item label="PI">{group.pi}</Descriptions.Item>
            <Descriptions.Item label="所属院系">{group.dept}</Descriptions.Item>
            <Descriptions.Item label="研究方向" span={2}>{group.field}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color="green">{group.status === 'active' ? '活跃' : '暂停'}</Tag></Descriptions.Item>
          </Descriptions>
        )},
        { key: 'budget', label: '经费台账', children: <Table dataSource={budget} rowKey="id" pagination={false} size="small" columns={[
          {title:'来源',dataIndex:'source'},{title:'类型',dataIndex:'type',render:(t:string)=><Tag color={typeColors[t]}>{t}</Tag>},
          {title:'金额',dataIndex:'amount',render:(v:number)=>'¥'+v.toLocaleString()},{title:'已支出',dataIndex:'used',render:(v:number)=>'¥'+v.toLocaleString()},
          {title:'余额',dataIndex:'remain',render:(v:number)=><Text type="success">¥{v.toLocaleString()}</Text>},
          {title:'执行率',dataIndex:'used',render:(_:any,r:BudgetItem)=><Progress percent={Math.round(r.used/r.amount*100)} size="small" />},
        ]} /> },
        { key: 'usage', label: '仪器使用统计', children: <Table dataSource={[
          {inst:'液相色谱仪',count:28,hours:56,fee:'¥2,800'},
          {inst:'ICP-MS质谱仪',count:18,hours:45,fee:'¥9,000'},
          {inst:'紫外分光光度计',count:15,hours:22,fee:'¥750'},
          {inst:'气相色谱仪',count:12,hours:30,fee:'¥3,600'},
        ]} rowKey="inst" pagination={false} size="small" columns={[
          {title:'仪器',dataIndex:'inst'},{title:'使用次数',dataIndex:'count'},{title:'使用时长(h)',dataIndex:'hours'},{title:'费用',dataIndex:'fee'},
        ]} /> },
      ]} />
    </Drawer>
  );
};

export const ResearchGroupPage: React.FC = () => {
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ResearchGroup | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/research/groups');
      const json = await res.json();
      setGroups(json.data?.list || []);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = groups.filter(g => g.name.includes(searchText) || g.pi.includes(searchText) || g.dept.includes(searchText));

  const stats = { total: groups.length, members: groups.reduce((s, g) => s + (g.members || 0), 0), budget: groups.reduce((s, g) => s + parseInt((g.budget || '').replace(/[¥,]/g, '')), 0), projects: groups.reduce((s, g) => s + (g.projects || 0), 0) };

  const handleCreate = async (values: any) => {
    message.success('课题组创建成功');
    setModalVisible(false);
    form.resetFields();
    fetchData();
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>课题组管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建课题组</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="课题组总数" value={stats.total} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="在组总人数" value={stats.members} prefix={<UserOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="可用经费总额" value={`¥${(stats.budget / 10000).toFixed(0)}万`} prefix={<FundOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="活跃项目数" value={stats.projects} prefix={<ToolOutlined />} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={6}>
          <Card title="组织树" size="small">
            <Tree treeData={[
              { title: '化学与分子工程学院', key: 'chem', children: [
                { title: <><Badge status="success" />环境分析课题组 <Tag>12人</Tag></>, key: 'rg1' },
                { title: <><Badge status="success" />光谱分析课题组 <Tag>8人</Tag></>, key: 'rg2' },
                { title: <><Badge status="success" />色谱质谱课题组 <Tag>15人</Tag></>, key: 'rg3' },
              ]},
              { title: '生命科学学院', key: 'bio', children: [
                { title: <><Badge status="success" />生物传感课题组 <Tag>10人</Tag></>, key: 'rge1' },
              ]},
              { title: '材料科学与工程学院', key: 'mat', children: [
                { title: <><Badge status="success" />纳米材料课题组 <Tag>14人</Tag></>, key: 'rge2' },
              ]},
            ]} defaultExpandAll onSelect={(keys) => {
              const g = groups.find(g => g.id === keys[0]);
              if (g) { setSelected(g); setDrawerVisible(true); }
            }} />
          </Card>
        </Col>
        <Col xs={24} lg={18}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Input placeholder="搜索课题组/PI/院系" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 260 }} allowClear />
            </Space>
            <Table dataSource={filtered} rowKey="id" loading={loading} columns={[
              { title: '课题组编号', dataIndex: 'id', key: 'id', render: (id: string) => <Text code>{id.toUpperCase()}</Text> },
              { title: '名称', dataIndex: 'name', key: 'name', render: (name: string, r: ResearchGroup) => <a onClick={() => { setSelected(r); setDrawerVisible(true); }}>{name}</a> },
              { title: '所属院系', dataIndex: 'dept', key: 'dept' },
              { title: 'PI', dataIndex: 'pi', key: 'pi' },
              { title: '在组人数', dataIndex: 'members', key: 'members' },
              { title: '经费余额', dataIndex: 'budget', key: 'budget' },
              { title: '活跃项目', dataIndex: 'projects', key: 'projects' },
              { title: '本月使用', dataIndex: 'instrumentUsage', key: 'instrumentUsage', render: (v: number) => <>{v}次</> },
              { title: '操作', key: 'action', render: (_: any, r: ResearchGroup) => (
                <Space>
                  <Button type="link" size="small" onClick={() => { setSelected(r); setDrawerVisible(true); }}>查看</Button>
                  <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
                </Space>
              )},
            ]} pagination={{ pageSize: 10 }} size="middle" />
          </Card>
        </Col>
      </Row>

      <GroupDetail group={selected} visible={drawerVisible} onClose={() => { setDrawerVisible(false); setSelected(null); }} />

      <Modal title="新建课题组" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="课题组名称" rules={[{ required: true }]}><Input placeholder="请输入名称" /></Form.Item>
          <Form.Item name="dept" label="所属院系" rules={[{ required: true }]}><Input placeholder="如：化学与分子工程学院" /></Form.Item>
          <Form.Item name="pi" label="PI（课题组长）" rules={[{ required: true }]}><Input placeholder="请输入PI姓名" /></Form.Item>
          <Form.Item name="field" label="研究方向"><Input placeholder="研究方向描述" /></Form.Item>
          <Button type="primary" block onClick={() => form.submit()}>创建</Button>
        </Form>
      </Modal>
    </div>
  );
};
