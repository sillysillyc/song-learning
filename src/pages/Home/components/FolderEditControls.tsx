import { memo } from 'react';
import { Button, Space } from 'antd';
import type { IFolder } from '@/store';
import { FolderDrawer } from './FolderDrawer';

interface FolderEditControlsProps {
  isEditing: boolean;
  selectedFolders: IFolder[];
  onEdit: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onCreate: () => void;
}

export const FolderEditControls = memo(
  ({ isEditing, selectedFolders, onEdit, onCancel, onConfirm, onCreate }: FolderEditControlsProps) => {
    if (isEditing) {
      return (
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={onConfirm}>
            确定
          </Button>
        </Space>
      );
    }

    return (
      <Space>
        <Button onClick={onEdit}>编辑</Button>
        <Button onClick={onCreate}>新增</Button>
        <FolderDrawer onCreate={onCreate} onCancel={onCancel} />
      </Space>
    );
  },
);
