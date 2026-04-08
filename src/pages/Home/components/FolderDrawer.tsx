import { memo } from 'react';
import { Drawer, Table, Button, type TableColumnType } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentFolder, selectIsFolderDrawerOpen } from '@/store/slices/folders/selectors';
import { setCurrentSong, updateIsFolderDrawerOpen } from '@/store/slices/folders/slice';
import type { ISong } from '@/store';

interface FolderDrawerProps {
  onCreate: () => void;
  onCancel: () => void;
}

export const FolderDrawer = memo(({ onCreate, onCancel }: FolderDrawerProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentFolder = useSelector(selectCurrentFolder);
  const isFolderDrawerOpen = useSelector(selectIsFolderDrawerOpen);

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
    },
    {
      title: '最新编辑时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record) => (
        <div>
          <Button
            type="link"
            onClick={() => {
              dispatch(setCurrentSong(record));
              navigate('/song');
            }}
          >
            查看
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              // TODO: 实现删除逻辑
              console.log('删除歌曲', record.id);
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  const onClose = () => {
    dispatch(updateIsFolderDrawerOpen(false));
  };

  return (
    <Drawer
      title={currentFolder?.name || '文件夹'}
      width={720}
      onClose={onClose}
      open={isFolderDrawerOpen}
      maskClosable={true} // 点击蒙层关闭
      extra={
        <>
          <Button onClick={onClose}>关闭</Button>
        </>
      }
    >
      {currentFolder && (
        <Table rowKey="id" dataSource={currentFolder.songs} columns={columns} pagination={false} size="small" />
      )}
    </Drawer>
  );
});
