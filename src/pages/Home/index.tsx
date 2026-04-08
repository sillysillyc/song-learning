import { memo, useEffect, useMemo, useState } from 'react';
import { Row, Col, Space, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { data } from './data';
import { FolderCard, FolderDrawer, FolderSearch, FolderEditControls } from './components';
import { setFoldersInfo } from '@/store/slices/folders/slice';
import { selectFolders, type IFolder } from '@/store';

export const Home = memo(() => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<IFolder[]>([]);
  const folders = useSelector(selectFolders);
  const dispatch = useDispatch();

  console.log('[folders]', folders);
  const sortedFolders = useMemo(() => [...folders].sort((a, b) => Number(a.updateTime) - Number(b.updateTime)), [folders]);

  // 初始化数据到 redux
  useEffect(() => {
    // dispatch(setFoldersInfo(data));
  }, []);

  const handleSearch = (id: string, name: string) => {
    const filteredFolders = folders.filter((folder) => {
      const matchesId = !id || folder.id.includes(id);
      const matchesName = !name || folder.name.includes(name);
      return matchesId && matchesName;
    });
    dispatch(setFoldersInfo(filteredFolders));
  };

  const handleReset = () => {
    dispatch(setFoldersInfo([...folders]));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFolders([]);
  };

  const handleConfirm = () => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedFolders.length} 个文件夹吗？`,
      onOk: () => {
        const updatedFolders = folders.filter((folder) => !selectedFolders.some((sf) => sf.id === folder.id));
        dispatch(setFoldersInfo(updatedFolders));
        setIsEditing(false);
        setSelectedFolders([]);
      },
    });
  };

  const handleCreate = () => {
    // TODO: 实现创建文件夹逻辑
    console.log('创建文件夹');
  };

  const handleFolderSelect = (folder: IFolder) => {
    if (isEditing) {
      setSelectedFolders((prev) =>
        prev.includes(folder) ? prev.filter((f) => f.id !== folder.id) : [...prev, folder],
      );
    }
  };

  return (
    <div className="home-page">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <FolderSearch onSearch={handleSearch} onReset={handleReset} />
          <FolderEditControls
            isEditing={isEditing}
            selectedFolders={selectedFolders}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            onCreate={handleCreate}
          />
        </Space>
        <Row gutter={[16, 16]}>
          {sortedFolders.map((folder) => (
            <Col key={folder.id} xs={24} sm={12} md={8}>
              <FolderCard
                folder={folder}
                isEditing={isEditing}
                isSelected={selectedFolders.some((f) => f.id === folder.id)}
                onSelect={() => handleFolderSelect(folder)}
                onDeleteFolder={(id) => {
                  const updatedFolders = folders.filter((f) => f.id !== id);
                  dispatch(setFoldersInfo(updatedFolders));
                }}
              />
            </Col>
          ))}
        </Row>
      </Space>
      <FolderDrawer onCreate={handleCreate} onCancel={handleCancel} />
    </div>
  );
});
