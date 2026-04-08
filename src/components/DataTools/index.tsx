import { memo, useState } from 'react';
import { FloatButton, Modal, Upload, message } from 'antd';
import { DownloadOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { exportDataToJSON, importDataFromJSON } from '@/utils/mockData';
import './index.less';

export const DataTools = memo(() => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 导出数据
  const handleExport = () => {
    exportDataToJSON();
    message.success('数据已导出');
  };

  // 导入数据
  const handleImport = () => {
    if (fileList.length === 0) {
      message.warning('请选择要导入的文件');
      return;
    }

    const file = fileList[0].originFileObj;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importDataFromJSON(content);
      if (success) {
        message.success('数据导入成功，请刷新页面');
        setIsImportModalOpen(false);
        setFileList([]);
        // 触发页面刷新
        setTimeout(() => window.location.reload(), 1000);
      } else {
        message.error('数据导入失败，请检查文件格式');
      }
    };
    reader.onerror = () => {
      message.error('文件读取失败');
    };
    reader.readAsText(file);
  };

  // 上传文件变更
  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  return (
    <>
      <FloatButton.Group
        shape="circle"
        icon={<FileTextOutlined />}
        className="data-tools-float-button"
      >
        <FloatButton
          icon={<DownloadOutlined />}
          tooltip="导出数据"
          onClick={handleExport}
        />
        <FloatButton
          icon={<UploadOutlined />}
          tooltip="导入数据"
          onClick={() => setIsImportModalOpen(true)}
        />
      </FloatButton.Group>

      {/* 导入数据弹窗 */}
      <Modal
        title="导入数据"
        open={isImportModalOpen}
        onOk={handleImport}
        onCancel={() => {
          setIsImportModalOpen(false);
          setFileList([]);
        }}
        okText="导入"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
          请选择之前导出的 JSON 文件进行导入
        </div>
        <Upload.Dragger
          name="file"
          accept=".json"
          maxCount={1}
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={(file) => {
            if (file.type !== 'application/json') {
              message.error('请上传 JSON 格式的文件');
              return false;
            }
            return false; // 阻止自动上传
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持的文件类型：.json</p>
        </Upload.Dragger>
      </Modal>
    </>
  );
});
