import { memo } from 'react';
import { Popover, Button, Space, Typography } from 'antd';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import type { ILyricMark } from '@/store';
import { getMarkStyle } from '@/utils/markUtils';
import './index.less';

export interface IMarkItemProps {
  mark: ILyricMark;
  selectedText: string;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const MarkItem = memo((props: IMarkItemProps) => {
  const { mark, selectedText, onClick, onDelete, onEdit } = props;

  const markStyle = getMarkStyle(mark.type, mark.style);

  // 渲染显示的内容
  const renderContent = () => {
    if (mark.content?.text) {
      return mark.content.text;
    }
    if (mark.content?.icon) {
      return mark.content.icon;
    }
    return selectedText;
  };

  // Popover 显示的详情内容
  const popoverContent = (
    <div style={{ maxWidth: 200 }}>
      {mark.content?.note && (
        <Typography.Paragraph style={{ marginBottom: 8 }}>{mark.content.note}</Typography.Paragraph>
      )}
      <Space>
        <Button type="primary" icon={<EditOutlined />} size="small" onClick={onEdit}>
          编辑
        </Button>
        <Button icon={<CloseOutlined />} size="small" onClick={onDelete}>
          删除
        </Button>
      </Space>
    </div>
  );

  return (
    <Popover content={popoverContent} title="标记详情" trigger="click" placement="top">
      <span
        className={`mark-item mark-type-${mark.type}`}
        style={markStyle}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {renderContent()}
      </span>
    </Popover>
  );
});
