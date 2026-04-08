import { memo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Affix, Button, Card, Space, Modal, Form, Input, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCurrentFolder,
  selectCurrentSong,
  setCurrentSong,
  updateFolderInfo,
} from '@/store';
import type { ISong } from '@/store';
import { LyricsEditor } from './components';
import dayjs from 'dayjs';
import './index.less';

export const SongDetail = memo(() => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentSong = useSelector(selectCurrentSong);
  const currentFolder = useSelector(selectCurrentFolder);

  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();

  // 进入编辑模式
  const handleEnterEditMode = useCallback(() => {
    if (currentSong) {
      form.setFieldsValue({
        name: currentSong.name,
        singer: currentSong.singer,
        album: currentSong.album,
        duration: currentSong.duration,
      });
      setIsEditMode(true);
    }
  }, [currentSong, form]);

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    form.resetFields();
  }, [form]);

  // 保存编辑
  const handleSaveEdit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (currentSong && currentFolder) {
        const updatedSong: ISong = {
          ...currentSong,
          ...values,
          updateTime: Date.now().toString(),
        };

        // 更新文件夹中的歌曲数据
        const updatedFolder = {
          ...currentFolder,
          songs: currentFolder.songs.map((s) => (s.id === currentSong.id ? updatedSong : s)),
        };

        dispatch(updateFolderInfo({ folder: updatedFolder }));
        dispatch(setCurrentSong(updatedSong));
        setIsEditMode(false);
        message.success('保存成功');
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [currentSong, currentFolder, dispatch, form]);

  // 删除歌曲
  const handleDeleteSong = useCallback(() => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除歌曲 "${currentSong?.name}" 吗？此操作不可恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      onOk: () => {
        if (currentFolder) {
          // 从文件夹中移除歌曲
          const updatedSongs = currentFolder.songs.filter((s) => s.id !== currentSong?.id);
          const updatedFolder = {
            ...currentFolder,
            songs: updatedSongs,
            songCount: updatedSongs.length,
            updateTime: Date.now().toString(),
          };

          dispatch(updateFolderInfo({ folder: updatedFolder }));
          dispatch(setCurrentSong(null as any));

          // 判断是否还有上一首歌
          if (updatedSongs.length > 0) {
            // 导航到上一首歌（列表中的第一首）
            dispatch(setCurrentSong(updatedSongs[0]));
            message.success('已删除当前歌曲，跳转到上一首');
          } else {
            // 没有歌曲了，返回首页
            navigate('/');
            message.success('已删除当前歌曲');
          }
        }
      },
    });
  }, [currentSong, currentFolder, dispatch, navigate]);

  if (!currentSong) {
    return (
      <Card title="歌曲详情">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: '#999' }}>暂无歌曲信息</p>
          <Button type="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="song-detail-page"
      title={
        isEditMode ? (
          <Form form={form} layout="inline" size="small">
            <Form.Item
              name="name"
              label="歌曲名称"
              rules={[{ required: true, message: '请输入歌曲名称' }]}
            >
              <Input placeholder="必填" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="singer" label="歌手">
              <Input placeholder="选填" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="album" label="专辑">
              <Input placeholder="选填" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="duration" label="时长">
              <Input placeholder="选填" style={{ width: 100 }} />
            </Form.Item>
          </Form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <strong>歌曲名称：</strong> {currentSong.name}
            </div>
            {currentSong.singer && <div><strong>歌手：</strong> {currentSong.singer}</div>}
            {currentSong.album && <div><strong>专辑：</strong> {currentSong.album}</div>}
            {currentSong.duration && <div><strong>时长：</strong> {currentSong.duration}</div>}
            <div style={{ fontSize: 12, color: '#999' }}>
              创建时间：{dayjs(Number(currentSong.createTime)).format('YYYY-MM-DD HH:mm:ss')}
              {' | '}
              更新时间：{dayjs(Number(currentSong.updateTime)).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        )
      }
      extra={
        <Affix offsetTop={60} target={() => document.querySelector<HTMLElement>('.ant-layout-content')}>
          <Space>
            {isEditMode ? (
              <>
                <Button type="primary" onClick={handleSaveEdit}>
                  保存
                </Button>
                <Button onClick={handleCancelEdit}>取消</Button>
              </>
            ) : (
              <>
                <Button onClick={handleEnterEditMode}>编辑</Button>
                <Button danger onClick={handleDeleteSong}>
                  删除
                </Button>
              </>
            )}
          </Space>
        </Affix>
      }
    >
      <LyricsEditor lyrics={currentSong.lyrics || []} />
    </Card>
  );
});
