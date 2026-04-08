import { memo, useMemo, useState } from 'react';
import { Row, Col, Modal, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { FolderCard, FolderDrawer, FolderSearch, FolderEditControls, CreateFolderDrawer } from './components';
import { setFoldersInfo } from '@/store/slices/folders/slice';
import { selectFolders, type IFolder } from '@/store';
import { generateMockFolders, importMockDataToStorage } from '@/utils/mockData';
import { DataTools } from '@/components/DataTools';
import './index.less';

export const Home = memo(() => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<IFolder[]>([]);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const folders = useSelector(selectFolders);
  const dispatch = useDispatch();

  const sortedFolders = useMemo(() => [...folders].sort((a, b) => Number(b.updateTime) - Number(a.updateTime)), [folders]);

  // 导入 Mock 数据
  const handleImportMockData = () => {
    Modal.confirm({
      title: '导入 Mock 数据',
      content: '确定要导入 50 条模拟数据吗？这将覆盖当前所有数据。',
      okText: '确认导入',
      cancelText: '取消',
      onOk: () => {
        const mockFolders = generateMockFolders(50);
        dispatch(setFoldersInfo(mockFolders));
        importMockDataToStorage(50);
        message.success('已导入 50 条模拟数据');
      },
    });
  };

  const handleSearch = (id: string, name: string) => {
    const filteredFolders = folders.filter((folder: IFolder) => {
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
        const updatedFolders = folders.filter((folder: IFolder) => !selectedFolders.some((sf: IFolder) => sf.id === folder.id));
        dispatch(setFoldersInfo(updatedFolders));
        setIsEditing(false);
        setSelectedFolders([]);
      },
    });
  };

  const handleCreate = () => {
    setIsCreateDrawerOpen(true);
  };

  const handleFolderSelect = (folder: IFolder) => {
    if (isEditing) {
      setSelectedFolders((prev) =>
        prev.includes(folder) ? prev.filter((f: IFolder) => f.id !== folder.id) : [...prev, folder],
      );
    }
  };

  return (
    <div className="home-page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <FolderSearch onSearch={handleSearch} onReset={handleReset} />
          <FolderEditControls
            isEditing={isEditing}
            selectedFolders={selectedFolders}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            onCreate={handleCreate}
          />
          <Button onClick={handleImportMockData}>导入 Mock 数据</Button>
        </div>
        <Row gutter={[16, 16]} className="folder-cards">
          {sortedFolders.map((folder) => (
            <Col key={folder.id} xs={24} sm={12} md={8}>
              <FolderCard
                folder={folder}
                isEditing={isEditing}
                isSelected={selectedFolders.some((f) => f.id === folder.id)}
                onSelect={() => handleFolderSelect(folder)}
                onDeleteFolder={(id) => {
                  const updatedFolders = folders.filter((f: IFolder) => f.id !== id);
                  dispatch(setFoldersInfo(updatedFolders));
                }}
              />
            </Col>
          ))}
        </Row>
      </div>
      <FolderDrawer />
      <CreateFolderDrawer open={isCreateDrawerOpen} onClose={() => setIsCreateDrawerOpen(false)} />
      <DataTools />
    </div>
  );
});
