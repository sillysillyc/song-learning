import { memo } from 'react';
import { Card, Button, Modal, Checkbox } from 'antd';
import { useDispatch } from 'react-redux';
import type { IFolder } from '@/store';
import { setCurrentFolder, updateIsFolderDrawerOpen } from '@/store/slices/folders/slice';
import dayjs from 'dayjs';
import './index.less';

interface FolderCardProps {
  folder: IFolder;
  onDeleteFolder: (id: string) => void;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const FolderCard = memo((props: FolderCardProps) => {
  const { folder, onDeleteFolder, isEditing = false, isSelected = false, onSelect } = props;
  const dispatch = useDispatch();

  const handleOpenDrawer = () => {
    dispatch(setCurrentFolder(folder));
    dispatch(updateIsFolderDrawerOpen(true));
  };

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文件夹 "${folder.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      centered: true,
      onOk: () => onDeleteFolder(folder.id),
    });
  };

  const onClickFolderId = (e: React.MouseEvent<HTMLElement, MouseEvent>, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
  };

  return (
    <Card
      className={`folder-card ${isEditing ? 'editing' : ''} ${isSelected ? 'selected' : ''}`}
      title={
        isEditing ? (
          <Checkbox checked={isSelected} onChange={() => onSelect?.()}>
            {folder.name}
          </Checkbox>
        ) : (
          folder.name
        )
      }
      extra={<Button onClick={handleDelete}>删除</Button>}
      onClick={isEditing ? undefined : handleOpenDrawer}
    >
      <div className="folder-info">
        <p
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          歌曲 ID:
          <Button type="link" onClick={(e) => onClickFolderId(e, folder.id)}>
            {folder.id}
          </Button>
        </p>
        <p>歌曲数量：{folder.songCount}</p>
        <p>创建时间：{dayjs(Number(folder.createTime)).format('YYYY-MM-DD HH:mm:ss')}</p>
        <p>更新时间：{dayjs(Number(folder.updateTime)).format('YYYY-MM-DD HH:mm:ss')}</p>
      </div>
    </Card>
  );
});
