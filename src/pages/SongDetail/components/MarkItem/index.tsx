import { memo } from 'react';
import { Popover, Button, Space, Typography } from 'antd';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import type { ILyricMark } from '@/store';
import { getMarkBackgroundColor } from '@/utils/markUtils';
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

  const bgColor = getMarkBackgroundColor(mark.color);

  const getShapeClass = () => {
    if (mark.shape === 'circle') return 'circle';
    if (mark.shape === 'square') return 'square';
    if (mark.shape === 'underline') return 'underline';
    return '';
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

  // 下划线标记特殊渲染
  if (mark.shape === 'underline') {
    return (
      <Popover content={popoverContent} title="标记详情" trigger="click" placement="top">
        <span
          className="mark-item underline"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {selectedText}
        </span>
      </Popover>
    );
  }

  const markContent = (
    <div
      className={`mark-item ${getShapeClass()}`}
      style={{ backgroundColor: bgColor }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <span className="symbol-text">{renderSymbol() || selectedText}</span>
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
        <Button icon={<CloseOutlined />} size="small" onClick={onDelete}>
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
