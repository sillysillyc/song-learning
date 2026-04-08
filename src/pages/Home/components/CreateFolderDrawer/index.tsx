import { memo } from 'react';
import { Drawer, Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { selectFolders, setFoldersInfo } from '@/store';
import type { IFolder } from '@/store';
import './index.less';

interface CreateFolderDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CreateFolderDrawer = memo((props: CreateFolderDrawerProps) => {
  const { open, onClose } = props;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const folders = useSelector(selectFolders);

  const handleSubmit = () => {
    void form.validateFields().then((values) => {
      const now = Date.now().toString();
      const newFolder: IFolder = {
        id: `folder_${now}_${Math.random().toString(36).substring(2, 9)}`,
        name: values.name as string,
        songCount: 0,
        createTime: now,
        updateTime: now,
        songs: [],
      };

      dispatch(setFoldersInfo([newFolder, ...folders]));
      message.success('文件夹创建成功');
      form.resetFields();
      onClose();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      className="create-folder-drawer"
      title="新增文件夹"
      placement="right"
      size="default"
      onClose={handleCancel}
      open={open}
      extra={
        <Button onClick={handleCancel}>取消</Button>
      }
    >
      <Form form={form} layout="vertical" size="large">
        <Form.Item
          name="name"
          label="文件夹名称"
          rules={[{ required: true, message: '请输入文件夹名称' }]}
        >
          <Input placeholder="请输入文件夹名称" />
        </Form.Item>
      </Form>

      <div className="form-actions">
        <Button type="primary" onClick={handleSubmit} block>
          确认创建
        </Button>
      </div>
    </Drawer>
  );
});
