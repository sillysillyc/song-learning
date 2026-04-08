import { memo, useState } from 'react';
import { Drawer, Table, Button, Space, Modal, message, Form, Input, type TableColumnType } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCurrentFolder,
  selectIsFolderDrawerOpen,
  selectFolders,
} from '@/store/slices/folders/selectors';
import { setCurrentSong, updateIsFolderDrawerOpen, updateFolderInfo, setFoldersInfo } from '@/store/slices/folders/slice';
import type { ISong, IFolder } from '@/store';
import dayjs from 'dayjs';
import './index.less';

export const FolderDrawer = memo(() => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentFolder = useSelector(selectCurrentFolder);
  const isFolderDrawerOpen = useSelector(selectIsFolderDrawerOpen);
  const folders = useSelector(selectFolders);

  const [isAddingSong, setIsAddingSong] = useState(false);
  const [form] = Form.useForm();

  const handleDeleteSong = (song: ISong) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除歌曲 "${song.name}" 吗？`,
      onOk: () => {
        if (currentFolder) {
          const updatedSongs = currentFolder.songs.filter((s: ISong) => s.id !== song.id);
          const updatedFolder: IFolder = {
            ...currentFolder,
            songs: updatedSongs,
            songCount: updatedSongs.length,
            updateTime: Date.now().toString(),
          };

          dispatch(updateFolderInfo({ folder: updatedFolder }));

          // 同时更新 folders 列表中的数据
          const updatedFolders = folders.map((f: IFolder) =>
            f.id === currentFolder.id ? updatedFolder : f
          );
          dispatch(setFoldersInfo(updatedFolders));

          message.success('歌曲已删除');
        }
      },
    });
  };

  const handleAddSong = () => {
    void form.validateFields().then((values) => {
      if (currentFolder) {
        const now = Date.now().toString();
        const newSong: ISong = {
          id: `song_${now}_${Math.random().toString(36).substring(2, 9)}`,
          name: values.name as string,
          singer: values.singer as string || '',
          album: values.album as string || '',
          duration: values.duration as string || '',
          createTime: now,
          updateTime: now,
          lyrics: [],
          marks: [],
        };

        const updatedFolder: IFolder = {
          ...currentFolder,
          songs: [newSong, ...currentFolder.songs],
          songCount: currentFolder.songs.length + 1,
          updateTime: now,
        };

        dispatch(updateFolderInfo({ folder: updatedFolder }));

        // 同时更新 folders 列表中的数据
        const updatedFolders = folders.map((f) =>
          f.id === currentFolder.id ? updatedFolder : f
        );
        dispatch(setFoldersInfo(updatedFolders));

        setIsAddingSong(false);
        form.resetFields();
        message.success('歌曲已添加');
      }
    });
  };

  const columns: TableColumnType<ISong>[] = [
    {
      title: '歌曲名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '歌手',
      dataIndex: 'singer',
      key: 'singer',
    },
    {
      title: '专辑',
      dataIndex: 'album',
      key: 'album',
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: string) => dayjs(Number(text)).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '最新编辑时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (text: string) => dayjs(Number(text)).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_: unknown, record: ISong) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => {
              dispatch(setCurrentSong(record));
              navigate('/song');
            }}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDeleteSong(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const onClose = () => {
    dispatch(updateIsFolderDrawerOpen(false));
    setIsAddingSong(false);
    form.resetFields();
  };

  return (
    <Drawer
      className="folder-drawer"
      title={currentFolder?.name || '文件夹'}
      width={720}
      onClose={onClose}
      open={isFolderDrawerOpen}
      maskClosable
      extra={
        <Space>
          {!isAddingSong && (
            <Button type="primary" onClick={() => setIsAddingSong(true)}>
              添加歌曲
            </Button>
          )}
          <Button onClick={onClose}>关闭</Button>
        </Space>
      }
    >
      {currentFolder && (
        <>
          {isAddingSong ? (
            <div className="add-song-form">
              <Form form={form} layout="vertical" size="small">
                <Form.Item
                  name="name"
                  label="歌曲名称"
                  rules={[{ required: true, message: '请输入歌曲名称' }]}
                >
                  <Input placeholder="必填" />
                </Form.Item>
                <Form.Item name="singer" label="歌手">
                  <Input placeholder="选填" />
                </Form.Item>
                <Form.Item name="album" label="专辑">
                  <Input placeholder="选填" />
                </Form.Item>
                <Form.Item name="duration" label="时长">
                  <Input placeholder="选填，如：3:45" />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={handleAddSong}>
                      确认添加
                    </Button>
                    <Button onClick={() => setIsAddingSong(false)}>取消</Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          ) : (
            <Table
              rowKey="id"
              dataSource={currentFolder.songs}
              columns={columns}
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
            />
          )}
        </>
      )}
    </Drawer>
  );
});
