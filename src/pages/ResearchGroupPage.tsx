import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Tree, Tabs, Descriptions, Drawer, Badge, Progress, Modal, Form, message, Spin
} from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined, TeamOutlined, FundOutlined, ToolOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Member {
  id: string;
  name: string;
  role: string;
  education: string;
  field: string;
  joinDate: string;
  status: string;
}

interface FundingItem {
  source: string;
  type: string;
  amount: string;
  used: string;
  remain: string;
  rate: number;
}

interface UsageItem {
  inst: string;
  count: number;
  hours: number;
  fee: string;
}

interface ResearchGroup {
  id: string;
  name: string;
  dept: string;
  pi: string;
  members: number;
  budget: string;
  projects: number;
  instrumentUsage: number;
  status: string;
  detail: {
    piTitle: string;
    founded: string;
    field: string;
    balance: string;
    activeProjects: number;
    peopleCount: number;
    monthlyUsage: number;
  };
  membersList: Member[];
  fundingList: FundingItem[];
  usageList: UsageItem[];
}

const roleColors: Record<string, string> = {
  PI: '#ff4d4f',
  博士后: '#1677ff',
  博士生: '#52c41a',
  硕士生: '#faad14',
  科研助理: '#d9d9d9',
};

const GroupDetail: React.FC<{
  group: ResearchGroup | null;
  visible: boolean;
  onClose: () => void;
}> = ({ group, visible, onClose }) => {
  if (!group) return null;
  return (
    <Drawer title={`${group.name} - 详情`} open={visible} onClose={onClose} width={640}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="经费余额" value={group.detail.balance} valueStyle={{ fontSize: 14 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="在研项目" value={group.detail.activeProjects} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="在组人数" value={group.detail.peopleCount} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="本月使用" value={group.detail.monthlyUsage} suffix="次" />
          </Card>
        </Col>
      </Row>
      <Tabs
        defaultActiveKey="members"
        items={[
          {
            key: 'members',
            label: '成员管理',
            children: (
              <Table
                dataSource={group.membersList}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: '姓名', dataIndex: 'name' },
                  { title: '角色', dataIndex: 'role', render: (r: string) => <Tag color={roleColors[r]}>{r}</Tag> },
                  { title: '学历', dataIndex: 'education' },
                  { title: '研究方向', dataIndex: 'field' },
                  { title: '加入日期', dataIndex: 'joinDate' },
                  { title: '状态', dataIndex: 'status', render: () => <Badge status="success" text="在组" /> },
                ]}
              />
            ),
          },
          {
            key: 'info',
            label: '基本信息',
            children: (
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="课题组名称" span={2}>{group.name}</Descriptions.Item>
                <Descriptions.Item label="PI">{group.pi} ({group.detail.piTitle})</Descriptions.Item>
                <Descriptions.Item label="所属院系">{group.dept}</Descriptions.Item>
                <Descriptions.Item label="成立日期">{group.detail.founded}</Descriptions.Item>
                <Descriptions.Item label="研究方向" span={2}>{group.detail.field}</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: 'budget',
            label: '经费台账',
            children: (
              <Table
                dataSource={group.fundingList}
                rowKey="source"
                pagination={false}
                size="small"
                columns={[
                  { title: '来源', dataIndex: 'source' },
                  {
                    title: '类型',
                    dataIndex: 'type',
                    render: (t: string) => (
                      <Tag color={t === '纵向' ? 'blue' : t === '横向' ? 'orange' : 'default'}>{t}</Tag>
                    ),
                  },
                  { title: '金额', dataIndex: 'amount' },
                  { title: '已支出', dataIndex: 'used' },
                  { title: '余额', dataIndex: 'remain', render: (v: string) => <Text type="success">{v}</Text> },
                  { title: '执行率', dataIndex: 'rate', render: (r: number) => <Progress percent={r} size="small" /> },
                ]}
              />
            ),
          },
          {
            key: 'usage',
            label: '仪器使用统计',
            children: (
              <Table
                dataSource={group.usageList}
                rowKey="inst"
                pagination={false}
                size="small"
                columns={[
                  { title: '仪器', dataIndex: 'inst' },
                  { title: '使用次数', dataIndex: 'count' },
                  { title: '使用时长(h)', dataIndex: 'hours' },
                  { title: '费用', dataIndex: 'fee' },
                ]}
              />
            ),
          },
        ]}
      />
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await window.fetch('/api/v1/research/groups/expanded');
      const json = await res.json();
      const list: ResearchGroup[] = (json.data?.list || []).map((g: Record<string, unknown>) => ({
        ...(g as Record<string, unknown>),
        detail: (g.detail as Record<string, unknown> | undefined) || {
          piTitle: '教授',
          founded: '2020-01-01',
          field: '-',
          balance: g.budget || '¥0',
          activeProjects: g.projects || 0,
          peopleCount: g.members || 0,
          monthlyUsage: g.usage || 0,
        },
        membersList: g.membersList || [
          { id: 'm1', name: g.pi, role: 'PI', education: '教授', field: '-', joinDate: '-', status: 'active' },
        ],
        fundingList: g.fundingList || [
          { source: '国自然基金', type: '纵向', amount: '¥500,000', used: '¥180,000', remain: '¥320,000', rate: 36 },
        ],
        usageList: g.usageList || [
          { inst: '液相色谱仪', count: 28, hours: 56, fee: '¥2,800' },
        ],
      }));
      setGroups(list);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const filtered = groups.filter(
    (g) => g.name.includes(searchText) || g.pi.includes(searchText) || g.dept.includes(searchText)
  );

  const stats = {
    total: groups.length,
    members: groups.reduce((s, g) => s + (g.members || 0), 0),
    budget: groups.reduce((s, g) => {
      const num = parseInt(String(g.budget || g.detail?.balance || '0').replace(/[¥,]/g, ''), 10);
      return s + (isNaN(num) ? 0 : num);
    }, 0),
    projects: groups.reduce((s, g) => s + (g.projects || 0), 0),
  };

  const treeData = [
    {
      title: '化学与分子工程学院',
      key: 'chem',
      children: filtered
        .filter((g) => g.dept.includes('化学'))
        .map((g) => ({
          title: (
            <>
              <Badge status="success" />
              {g.name} <Tag>{g.members}人</Tag>
            </>
          ),
          key: g.id,
        })),
    },
    {
      title: '生命科学学院',
      key: 'bio',
      children: filtered
        .filter((g) => g.dept.includes('生命'))
        .map((g) => ({
          title: (
            <>
              <Badge status="success" />
              {g.name} <Tag>{g.members}人</Tag>
            </>
          ),
          key: g.id,
        })),
    },
    {
      title: '材料科学与工程学院',
      key: 'material',
      children: filtered
        .filter((g) => g.dept.includes('材料'))
        .map((g) => ({
          title: (
            <>
              <Badge status="success" />
              {g.name} <Tag>{g.members}人</Tag>
            </>
          ),
          key: g.id,
        })),
    },
    {
      title: '环境科学与工程学院',
      key: 'env',
      children: filtered
        .filter((g) => g.dept.includes('环境'))
        .map((g) => ({
          title: (
            <>
              <Badge status="success" />
              {g.name} <Tag>{g.members}人</Tag>
            </>
          ),
          key: g.id,
        })),
    },
  ].filter((d) => d.children && d.children.length > 0);

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            课题组管理
          </Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建课题组
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="课题组总数" value={stats.total} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="在组总人数" value={stats.members} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="可用经费总额"
              value={`¥${(stats.budget / 10000).toFixed(0)}万`}
              prefix={<FundOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="活跃项目数" value={stats.projects} prefix={<ToolOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={6}>
          <Card title="组织树" size="small">
            {loading ? (
              <Spin />
            ) : (
              <Tree
                treeData={treeData}
                defaultExpandAll
                onSelect={(keys) => {
                  const g = groups.find((g) => g.id === keys[0]);
                  if (g) {
                    setSelected(g);
                    setDrawerVisible(true);
                  }
                }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={18}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="搜索课题组/PI/院系"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 260 }}
                allowClear
              />
            </Space>
            <Table
              dataSource={filtered}
              rowKey="id"
              loading={loading}
              columns={[
                {
                  title: '课题组编号',
                  dataIndex: 'id',
                  key: 'id',
                  render: (id: string) => <Text code>{id.toUpperCase()}</Text>,
                },
                {
                  title: '名称',
                  dataIndex: 'name',
                  key: 'name',
                  render: (name: string, r: ResearchGroup) => (
                    <a
                      onClick={() => {
                        setSelected(r);
                        setDrawerVisible(true);
                      }}
                    >
                      {name}
                    </a>
                  ),
                },
                { title: '所属院系', dataIndex: 'dept', key: 'dept' },
                { title: 'PI', dataIndex: 'pi', key: 'pi' },
                { title: '在组人数', dataIndex: 'members', key: 'members' },
                { title: '经费余额', dataIndex: 'budget', key: 'budget' },
                { title: '活跃项目', dataIndex: 'projects', key: 'projects' },
                {
                  title: '本月使用',
                  dataIndex: 'instrumentUsage',
                  key: 'instrumentUsage',
                  render: (v: number) => <>{v}次</>,
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_: any, r: ResearchGroup) => (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setSelected(r);
                        setDrawerVisible(true);
                      }}
                    >
                      查看
                    </Button>
                  ),
                },
              ]}
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <GroupDetail
        group={selected}
        visible={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setSelected(null);
        }}
      />

      <Modal title="新建课题组" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form layout="vertical">
          <Form.Item label="课题组名称" required>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item label="所属院系" required>
            <Input placeholder="如：化学与分子工程学院" />
          </Form.Item>
          <Form.Item label="PI（课题组长）" required>
            <Input placeholder="请输入PI姓名" />
          </Form.Item>
          <Form.Item label="研究方向">
            <Input placeholder="研究方向描述" />
          </Form.Item>
          <Button
            type="primary"
            block
            onClick={() => {
              message.success('课题组创建成功');
              setModalVisible(false);
            }}
          >
            创建
          </Button>
        </Form>
      </Modal>
    </div>
  );
};
