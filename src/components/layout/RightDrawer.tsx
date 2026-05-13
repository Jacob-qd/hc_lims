import React from 'react';
import { Drawer, List, Avatar, Typography, Space } from 'antd';
import {
  BellOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: '1',
    title: '样品 SP-2025-001 已入库',
    desc: '样品登记完成，等待分配检测任务',
    time: '5分钟前',
    type: 'success',
  },
  {
    id: '2',
    title: '报告 RP-2025-045 待审核',
    desc: '检测报告已编制完成，请尽快审核',
    time: '30分钟前',
    type: 'warning',
  },
  {
    id: '3',
    title: '任务 TK-2025-128 超时',
    desc: '检测任务已超出预定完成时间',
    time: '2小时前',
    type: 'error',
  },
];

export const RightDrawer: React.FC<RightDrawerProps> = ({ open, onClose }) => {
  return (
    <Drawer
      title={
        <Space>
          <BellOutlined />
          <span>通知中心</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={360}
    >
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={
                    item.type === 'success' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : item.type === 'warning' ? (
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                    ) : (
                      <MessageOutlined style={{ color: '#f5222d' }} />
                    )
                  }
                  style={{ backgroundColor: 'var(--bg-body)' }}
                />
              }
              title={<Text strong>{item.title}</Text>}
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.desc}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {item.time}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};
