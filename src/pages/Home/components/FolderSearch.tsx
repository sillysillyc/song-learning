import { memo } from 'react';
import { Form, Input, Button, Space } from 'antd';
import type { IFolder } from '@/store';

interface FolderSearchProps {
  onSearch: (id: string, name: string) => void;
  onReset: () => void;
}

export const FolderSearch = memo(({ onSearch, onReset }: FolderSearchProps) => {
  const [form] = Form.useForm();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onSearch(values.id || '', values.name || '');
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Form
      form={form}
      layout="inline"
      className="folder-search-form"
      onFinish={handleSearch}
    >
      <Form.Item name="id" label="ID">
        <Input placeholder="请输入文件夹ID" allowClear />
      </Form.Item>
      <Form.Item name="name" label="名称">
        <Input placeholder="请输入文件夹名称" allowClear />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Form.Item>
    </Form>
  );
});
