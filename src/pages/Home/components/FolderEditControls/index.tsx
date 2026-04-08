import { memo } from 'react';
import { Button, Space } from 'antd';
import type { IFolder } from '@/store';
import './index.less';

interface FolderEditControlsProps {
  isEditing: boolean;
  selectedFolders: IFolder[];
  onEdit: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onCreate: () => void;
}

export const FolderEditControls = memo(
  ({ isEditing, onEdit, onCancel, onConfirm, onCreate }: FolderEditControlsProps) => {
    if (isEditing) {
      return (
        <Space className="folder-edit-controls">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={onConfirm}>
            确定
          </Button>
        </Space>
      );
    }

    return (
      <Space className="folder-edit-controls">
        <Button onClick={onEdit}>编辑</Button>
        <Button type="primary" onClick={onCreate}>
          新增
        </Button>
      </Space>
    );
  },
);
