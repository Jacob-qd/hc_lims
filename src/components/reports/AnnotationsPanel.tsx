import React, { useState } from 'react';
import {
  Button, Input, Empty, List, Tag, Badge, Space, Typography, message,
} from 'antd';
import { CommentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ReportAnnotation } from '../../mocks/data';

const { Text } = Typography;
const { TextArea } = Input;

export interface AnnotationsPanelProps {
  annotations: ReportAnnotation[];
  reportId: string;
  onAdd: (content: string, mentions: string[]) => void;
  onResolve: (annId: string) => void;
  onReply: (annId: string, content: string) => void;
}

/** 批注功能面板 */
export const AnnotationsPanel: React.FC<AnnotationsPanelProps> = ({
  annotations, reportId: _reportId, onAdd, onResolve, onReply,
}) => {
  const [newContent, setNewContent] = useState('');
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});

  const handleAdd = () => {
    if (!newContent.trim()) { message.warning('请输入批注内容'); return; }
    const mentionMatches = newContent.match(/@(\S+)/g) || [];
    const mentions = mentionMatches.map(m => m.slice(1));
    onAdd(newContent, mentions);
    setNewContent('');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <TextArea
          placeholder="添加批注，使用 @用户名 提及相关人员..."
          rows={3}
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
        />
        <Button
          type="primary"
          size="small"
          icon={<CommentOutlined />}
          onClick={handleAdd}
          style={{ marginTop: 8 }}
        >
          添加批注
        </Button>
      </div>

      {annotations.length === 0 ? (
        <Empty description="暂无批注" />
      ) : (
        <List
          dataSource={annotations}
          renderItem={(ann) => (
            <List.Item
              actions={
                ann.status === 'open'
                  ? [
                      <Button
                        key="resolve"
                        type="link"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => onResolve(ann.id)}
                      >
                        解决
                      </Button>,
                    ]
                  : [<Tag key="done" color="success">已解决</Tag>]
              }
            >
              <List.Item.Meta
                avatar={<Badge status={ann.status === 'open' ? 'warning' : 'success'} />}
                title={
                  <Space>
                    <Text strong>{ann.authorName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{ann.createdAt}</Text>
                    {ann.mentions.length > 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        @{ann.mentions.join(', ')}
                      </Text>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Text>{ann.content}</Text>
                    {ann.replies.length > 0 && (
                      <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px solid #e8e8e8' }}>
                        {ann.replies.map(reply => (
                          <div key={reply.id} style={{ marginBottom: 4 }}>
                            <Text strong style={{ fontSize: 12 }}>{reply.authorName}</Text>
                            <Text style={{ fontSize: 12, marginLeft: 8 }}>{reply.content}</Text>
                            <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>{reply.createdAt}</Text>
                          </div>
                        ))}
                      </div>
                    )}
                    {ann.status === 'open' && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <Input
                          size="small"
                          placeholder="回复..."
                          style={{ flex: 1 }}
                          value={replyContents[ann.id] || ''}
                          onChange={e => setReplyContents({ ...replyContents, [ann.id]: e.target.value })}
                        />
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => {
                            const content = replyContents[ann.id];
                            if (!content?.trim()) { message.warning('请输入回复内容'); return; }
                            onReply(ann.id, content);
                            setReplyContents({ ...replyContents, [ann.id]: '' });
                          }}
                        >
                          回复
                        </Button>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};
