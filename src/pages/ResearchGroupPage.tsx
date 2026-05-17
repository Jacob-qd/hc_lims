import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Tree, Tabs, Descriptions, Drawer, Badge, Progress, Modal, Form, message, Segmented, List, Avatar } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined, TeamOutlined, FundOutlined, ToolOutlined, ExperimentOutlined, TrophyOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Member {
  id: string; name: string; role: string; education: string; field: string; joinDate: string; status: string;
}

interface ResearchGroup {
  id: string; name: string; dept: string; pi: string; members: number; budget: string; projects: number; instrumentUsage: number; status: string;
  detail: { piTitle: string; founded: string; field: string; balance: string; activeProjects: number; peopleCount: number; monthlyUsage: number };
  membersList: Member[];
}

const groups: ResearchGroup[] = [
  { id: 'rg1', name: '环境分析课题组', dept: '化学与分子工程学院', pi: '张明', members: 12, budget: '¥1,280,000', projects: 4, instrumentUsage: 86, status: 'active',
    detail: { piTitle: '教授', founded: '2021-09-01', field: '环境水质 / VOCs / 重金属', balance: '¥1,280,000', activeProjects: 4, peopleCount: 12, monthlyUsage: 86 },
    membersList: [
      { id: 'm1', name: '张明', role: 'PI', education: '教授/博导', field: '环境污染物高灵敏检测', joinDate: '2021-09-01', status: 'active' },
      { id: 'm2', name: '李华', role: '博士后', education: '博士', field: 'VOCs在线监测技术', joinDate: '2023-07-01', status: 'active' },
      { id: 'm3', name: '王芳', role: '博士生', education: '博士在读', field: '水质自动监测系统', joinDate: '2022-09-01', status: 'active' },
      { id: 'm4', name: '赵岩', role: '硕士生', education: '硕士在读', field: '环境样品前处理', joinDate: '2023-09-01', status: 'active' },
      { id: 'm5', name: '陈静', role: '科研助理', education: '本科', field: '实验室日常管理', joinDate: '2022-03-01', status: 'active' },
    ]},
  { id: 'rg2', name: '光谱分析课题组', dept: '化学与分子工程学院', pi: '李华', members: 8, budget: '¥860,000', projects: 3, instrumentUsage: 45, status: 'active',
    detail: { piTitle: '副教授', founded: '2022-03-15', field: '光谱分析 / 纳米材料', balance: '¥860,000', activeProjects: 3, peopleCount: 8, monthlyUsage: 45 },
    membersList: [
      { id: 'm6', name: '李华', role: 'PI', education: '副教授', field: '光谱分析新技术', joinDate: '2022-03-15', status: 'active' },
      { id: 'm7', name: '刘洋', role: '博士生', education: '博士在读', field: '拉曼光谱应用', joinDate: '2022-09-01', status: 'active' },
    ]},
  { id: 'rg3', name: '色谱质谱课题组', dept: '化学与分子工程学院', pi: '王强', members: 15, budget: '¥2,100,000', projects: 5, instrumentUsage: 120, status: 'active',
    detail: { piTitle: '教授', founded: '2020-06-01', field: '色谱分析 / 质谱技术', balance: '¥2,100,000', activeProjects: 5, peopleCount: 15, monthlyUsage: 120 },
    membersList: [
      { id: 'm8', name: '王强', role: 'PI', education: '教授/博导', field: '色谱质谱联用技术', joinDate: '2020-06-01', status: 'active' },
      { id: 'm9', name: '周敏', role: '博士后', education: '博士', field: '高分辨质谱', joinDate: '2024-01-01', status: 'active' },
    ]},
];

const roleColors: Record<string, string> = { PI: '#ff4d4f', 博士后: '#1677ff', 博士生: '#52c41a', 硕士生: '#faad14', 科研助理: '#d9d9d9' };

const GroupDetail: React.FC<{ group: ResearchGroup | null; visible: boolean; onClose: () => void }> = ({ group, visible, onClose }) => {
  if (!group) return null;
  const budgetData = [
    {source:'国自然基金-面上项目',type:'纵向',amount:'¥500,000',used:'¥180,000',remain:'¥320,000',rate:36},
    {source:'企业合作-绿源环保',type:'横向',amount:'¥300,000',used:'¥120,000',remain:'¥180,000',rate:40},
    {source:'校内启动金',type:'校内',amount:'¥100,000',used:'¥50,000',remain:'¥50,000',rate:50},
    {source:'省自然科学基金',type:'纵向',amount:'¥380,000',used:'¥90,000',remain:'¥290,000',rate:24},
  ];
  const projectData = [
    {no:'NSFC-2024-001',name:'新型二维材料的界面调控机制研究',pi:'张明',budget:'¥580,000',progress:22,status:'在研'},
    {no:'SJ-2024-002',name:'地表水VOCs在线监测技术开发',pi:'张明',budget:'¥350,000',progress:45,status:'在研'},
  ];
  const achievementData = [
    {title:'新型二维材料在高效催化中的结构调控',type:'论文',journal:'Nature Materials',year:2025,status:'published'},
    {title:'一种VOCs在线监测预处理装置',type:'专利',journal:'国家发明专利',year:2025,status:'pending'},
  ];
  const usageData = [
    {inst:'液相色谱仪 LC-001',count:28,hours:56,fee:'¥2,800'},
    {inst:'ICP-MS质谱仪 ICP-001',count:18,hours:45,fee:'¥9,000'},
    {inst:'紫外分光光度计 UV-001',count:15,hours:22,fee:'¥750'},
    {inst:'气相色谱仪 GC-002',count:12,hours:30,fee:'¥3,600'},
  ];
  return (
    <Drawer title={<Space><TeamOutlined />{group.name}</Space>} open={visible} onClose={onClose} width={720}>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={4} style={{ textAlign: 'center' }}>
            <Avatar size={64} style={{ background: '#1677ff' }}>{group.pi[0]}</Avatar>
          </Col>
          <Col span={20}>
            <Row gutter={16}>
              <Col span={6}><Statistic title="PI" value={group.pi} valueStyle={{ fontSize: 14 }} /></Col>
              <Col span={6}><Statistic title="职称" value={group.detail.piTitle} valueStyle={{ fontSize: 14 }} /></Col>
              <Col span={6}><Statistic title="成立日期" value={group.detail.founded} valueStyle={{ fontSize: 14 }} /></Col>
              <Col span={6}><Statistic title="状态" value="在研" valueStyle={{ fontSize: 14, color: '#52c41a' }} /></Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="经费余额" value={group.detail.balance} valueStyle={{ fontSize: 14, color: '#52c41a' }} prefix={<FundOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="在研项目" value={group.detail.activeProjects} prefix={<ExperimentOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="在组人数" value={group.detail.peopleCount} prefix={<UserOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="本月使用" value={group.detail.monthlyUsage} suffix="次" prefix={<ToolOutlined />} /></Card></Col>
      </Row>
      <Tabs defaultActiveKey="members" items={[
        { key: 'members', label: '成员管理', children: (
          <>
            <Button type="primary" size="small" icon={<PlusOutlined />} style={{ marginBottom: 8 }}>添加成员</Button>
            <Table dataSource={group.membersList} rowKey="id" pagination={false} size="small" columns={[
              { title: '姓名', dataIndex: 'name' },
              { title: '角色', dataIndex: 'role', render: (r: string) => <Tag color={roleColors[r]}>{r}</Tag> },
              { title: '学历', dataIndex: 'education' },
              { title: '研究方向', dataIndex: 'field' },
              { title: '加入日期', dataIndex: 'joinDate' },
              { title: '状态', dataIndex: 'status', render: () => <Badge status="success" text="在组" /> },
            ]} />
          </>
        )},
        { key: 'info', label: '基本信息', children: (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="课题组名称" span={2}>{group.name}</Descriptions.Item>
            <Descriptions.Item label="PI">{group.pi} ({group.detail.piTitle})</Descriptions.Item>
            <Descriptions.Item label="所属院系">{group.dept}</Descriptions.Item>
            <Descriptions.Item label="成立日期">{group.detail.founded}</Descriptions.Item>
            <Descriptions.Item label="研究方向" span={2}>{group.detail.field}</Descriptions.Item>
            <Descriptions.Item label="在组人数">{group.detail.peopleCount} 人</Descriptions.Item>
            <Descriptions.Item label="活跃项目">{group.detail.activeProjects} 个</Descriptions.Item>
          </Descriptions>
        )},
        { key: 'projects', label: '研究项目', children: (
          <Table dataSource={projectData} rowKey="no" pagination={false} size="small" columns={[
            {title:'项目编号',dataIndex:'no',render:(n:string)=><Text code>{n}</Text>},
            {title:'项目名称',dataIndex:'name'},
            {title:'PI',dataIndex:'pi'},
            {title:'经费',dataIndex:'budget'},
            {title:'进度',dataIndex:'progress',render:(p:number)=><Progress percent={p} size="small" />},
            {title:'状态',dataIndex:'status',render:(s:string)=><Tag color="green">{s}</Tag>},
          ]} />
        )},
        { key: 'budget', label: '经费台账', children: (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}><Card size="small"><Statistic title="总经费" value={group.budget} prefix={<FundOutlined />} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="已支出" value="¥350,000" valueStyle={{ color: '#1677ff' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="执行率" value={27} suffix="%" valueStyle={{ color: '#52c41a' }} /></Card></Col>
            </Row>
            <Table dataSource={budgetData} rowKey="source" pagination={false} size="small" columns={[
              {title:'来源',dataIndex:'source'},{title:'类型',dataIndex:'type',render:(t:string) => <Tag color={t==='纵向'?'blue':t==='横向'?'orange':'default'}>{t}</Tag>},
              {title:'金额',dataIndex:'amount'},{title:'已支出',dataIndex:'used'},{title:'余额',dataIndex:'remain',render:(v:string) => <Text type="success">{v}</Text>},
              {title:'执行率',dataIndex:'rate',render:(r:number) => <Progress percent={r} size="small" />},
            ]} />
          </>
        )},
        { key: 'achievements', label: '成果汇总', children: (
          <List dataSource={achievementData} renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<Space>{item.type==='论文'?<BookOutlined />:<TrophyOutlined />}{item.title}</Space>}
                description={<Space><Tag color={item.type==='论文'?'blue':'green'}>{item.type}</Tag><Text type="secondary">{item.journal} · {item.year}</Text></Space>}
              />
              <Tag color={item.status==='published'?'green':'orange'}>{item.status==='published'?'已发表':'审核中'}</Tag>
            </List.Item>
          )} />
        )},
        { key: 'usage', label: '仪器使用统计', children: (
          <Table dataSource={usageData} rowKey="inst" pagination={false} size="small" columns={[
            {title:'仪器',dataIndex:'inst'},{title:'使用次数',dataIndex:'count'},{title:'使用时长(h)',dataIndex:'hours'},{title:'费用',dataIndex:'fee'},
          ]} />
        )},
      ]} />
    </Drawer>
  );
};

export const ResearchGroupPage: React.FC = () => {
  const [selected, setSelected] = useState<ResearchGroup | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = groups.filter(g => {
    const matchSearch = g.name.includes(searchText) || g.pi.includes(searchText) || g.dept.includes(searchText);
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: groups.length, members: groups.reduce((s, g) => s + g.members, 0), budget: groups.reduce((s, g) => s + parseInt(g.budget.replace(/[¥,]/g, '')), 0), projects: groups.reduce((s, g) => s + g.projects, 0) };

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
        <Col xs={24} lg={5}>
          <Card title="组织树" size="small">
            <Tree treeData={[
              { title: '化学与分子工程学院', key: '0', children: [
                { title: <><Badge status="success" />环境分析课题组 <Tag>12人</Tag></>, key: 'rg1' },
                { title: <><Badge status="success" />光谱分析课题组 <Tag>8人</Tag></>, key: 'rg2' },
                { title: <><Badge status="success" />色谱质谱课题组 <Tag>15人</Tag></>, key: 'rg3' },
              ]},
            ]} defaultExpandAll onSelect={(keys) => {
              const g = groups.find(g => g.id === keys[0]);
              if (g) { setSelected(g); setDrawerVisible(true); }
            }} />
          </Card>
        </Col>
        <Col xs={24} lg={19}>
          <Card>
            <Space style={{ marginBottom: 16 }} wrap>
              <Input placeholder="搜索课题组/PI/院系" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 260 }} allowClear />
              <Segmented options={[{label:'全部',value:'all'},{label:'在研',value:'active'},{label:'已结题',value:'closed'},{label:'暂停',value:'paused'}]} value={statusFilter} onChange={v => setStatusFilter(v as string)} />
            </Space>
            <Table dataSource={filtered} rowKey="id" columns={[
              { title: '课题组编号', dataIndex: 'id', key: 'id', render: (id: string) => <Text code>{id.toUpperCase()}</Text> },
              { title: '名称', dataIndex: 'name', key: 'name', render: (name: string, r: ResearchGroup) => <a onClick={() => { setSelected(r); setDrawerVisible(true); }}>{name}</a> },
              { title: '所属院系', dataIndex: 'dept', key: 'dept' },
              { title: 'PI', dataIndex: 'pi', key: 'pi' },
              { title: '在组人数', dataIndex: 'members', key: 'members' },
              { title: '经费余额', dataIndex: 'budget', key: 'budget' },
              { title: '活跃项目', dataIndex: 'projects', key: 'projects' },
              { title: '本月使用', dataIndex: 'instrumentUsage', key: 'instrumentUsage', render: (v: number) => <>{v}次</> },
              { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Badge status={s==='active'?'success':'default'} text={s==='active'?'在研':'其他'} /> },
              { title: '操作', key: 'action', render: (_: any, r: ResearchGroup) => <Button type="link" size="small" onClick={() => { setSelected(r); setDrawerVisible(true); }}>查看</Button> },
            ]} pagination={{ pageSize: 10 }} size="middle" />
          </Card>
        </Col>
      </Row>

      <GroupDetail group={selected} visible={drawerVisible} onClose={() => { setDrawerVisible(false); setSelected(null); }} />

      <Modal title="新建课题组" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form layout="vertical">
          <Form.Item label="课题组名称" required><Input placeholder="请输入名称" /></Form.Item>
          <Form.Item label="所属院系" required><Input placeholder="如：化学与分子工程学院" /></Form.Item>
          <Form.Item label="PI（课题组长）" required><Input placeholder="请输入PI姓名" /></Form.Item>
          <Form.Item label="研究方向"><Input placeholder="研究方向描述" /></Form.Item>
          <Button type="primary" block onClick={() => { message.success('课题组创建成功'); setModalVisible(false); }}>创建</Button>
        </Form>
      </Modal>
    </div>
  );
};
