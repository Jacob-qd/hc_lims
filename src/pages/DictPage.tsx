import React from 'react';
import { Card, Table, Tag, Tabs, Button, Space, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const dictData: Record<string, { code: string; name: string; sort: number; status: string }[]> = {
  sampleType: [
    { code: 'surface_water', name: '地表水', sort: 1, status: 'active' },
    { code: 'groundwater', name: '地下水', sort: 2, status: 'active' },
    { code: 'drinking_water', name: '饮用水', sort: 3, status: 'active' },
    { code: 'waste_water', name: '废水', sort: 4, status: 'active' },
    { code: 'soil', name: '土壤', sort: 5, status: 'active' },
    { code: 'air', name: '环境空气', sort: 6, status: 'active' },
    { code: 'noise', name: '噪声', sort: 7, status: 'active' },
  ],
  testItem: [
    { code: 'ph', name: 'pH值', sort: 1, status: 'active' },
    { code: 'cod', name: '化学需氧量(COD)', sort: 2, status: 'active' },
    { code: 'nh3', name: '氨氮', sort: 3, status: 'active' },
    { code: 'tp', name: '总磷', sort: 4, status: 'active' },
    { code: 'pb', name: '重金属(Pb)', sort: 5, status: 'active' },
    { code: 'pm25', name: 'PM2.5', sort: 6, status: 'active' },
  ],
  priority: [
    { code: 'urgent', name: '紧急', sort: 1, status: 'active' },
    { code: 'high', name: '高', sort: 2, status: 'active' },
    { code: 'medium', name: '中', sort: 3, status: 'active' },
    { code: 'low', name: '低', sort: 4, status: 'active' },
  ],
};

const dictLabels: Record<string, string> = { sampleType: '样品类型', testItem: '检测项目', priority: '优先级' };

export const DictPage: React.FC = () => (
  <div>
    <Title level={4} style={{marginBottom:16}}>数据字典</Title>
    <Tabs items={Object.entries(dictData).map(([key, data]) => ({
      key, label: dictLabels[key],
      children: <Card extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => message.success('新增成功')}>新增</Button>}>
        <Table dataSource={data} rowKey="code" pagination={false} size="middle" columns={[
          { title: '编码', dataIndex: 'code' },
          { title: '名称', dataIndex: 'name' },
          { title: '排序', dataIndex: 'sort' },
          { title: '状态', dataIndex: 'status', render: () => <Tag color="green">启用</Tag> },
          { title: '操作', render: () => <Space><Button type="link" size="small" onClick={() => message.success('编辑字典项')}>编辑</Button><Button type="link" size="small" danger onClick={() => message.success('已删除')}>删除</Button></Space> },
        ]} />
      </Card>,
    }))} />
  </div>
);
