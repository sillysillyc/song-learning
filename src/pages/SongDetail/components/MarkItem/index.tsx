import { memo } from 'react';
import { Avatar, Popover, Button, Space, Typography } from 'antd';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import type { ILyricMark } from '@/store';
import { getMarkBackgroundColor } from '@/utils/markUtils';

export interface IMarkItemProps {
  mark: ILyricMark;
  selectedText: string;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const MarkItem = memo((props: IMarkItemProps) => {
  const { mark, selectedText, onClick, onDelete, onEdit } = props;

  const bgColor = getMarkBackgroundColor(mark.color);

  // 根据形状计算边框半径
  const getBorderRadius = () => {
    switch (mark.shape) {
      case 'circle':
        return '50%';
      case 'square':
        return 4;
      default:
        return 8;
    }
  };

  // 渲染符号
  const renderSymbol = () => {
    if (mark.symbol.type === 'emoji') {
      return mark.symbol.value;
    } else if (mark.symbol.type === 'text') {
      return mark.symbol.value;
    }
    return null;
  };

  const markContent = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 24,
        height: 24,
        padding: '2px 6px',
        backgroundColor: bgColor,
        borderRadius: getBorderRadius(),
        cursor: 'pointer',
        marginRight: 2,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {renderSymbol() || selectedText}
    </div>
  );

  // Popover 显示的详情内容
  const popoverContent = (
    <div style={{ maxWidth: 200 }}>
      {mark.note && <Typography.Paragraph style={{ marginBottom: 8 }}>{mark.note}</Typography.Paragraph>}
      <Space>
        <Button type="primary" icon={<EditOutlined />} size="small" onClick={onEdit}>
          编辑
        </Button>
        <Button danger icon={<CloseOutlined />} size="small" onClick={onDelete}>
          删除
        </Button>
      </Space>
    </div>
  );

  return (
    <Popover content={popoverContent} title="标记详情" trigger="click" placement="top">
      {markContent}
    </Popover>
  );
});
