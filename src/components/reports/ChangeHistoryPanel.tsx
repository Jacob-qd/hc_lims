import React from 'react';
import { Empty, Timeline } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import Typography from 'antd/es/typography';
import type { ReportChangeEntry } from '../../mocks/data';

const { Text } = Typography;

/** 变更历史面板 */
export const ChangeHistoryPanel: React.FC<{ history: ReportChangeEntry[] }> = ({ history }) => {
  if (history.length === 0) {
    return <Empty description="暂无变更记录" />;
  }
  return (
    <Timeline
      items={history.map(h => ({
        color: 'blue',
        children: (
          <div>
            <Text strong>{h.field}</Text>
            <div style={{ fontSize: 12, color: '#999' }}>{h.operator} · {h.changedAt}</div>
            <div style={{ fontSize: 12 }}>
              <Text type="secondary">变更：</Text>
              <Text delete style={{ fontSize: 12 }}>{h.oldValue}</Text>
              <ArrowRightOutlined style={{ margin: '0 8px', fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{h.newValue}</Text>
            </div>
          </div>
        ),
      }))}
    />
  );
};
