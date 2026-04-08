import { Layout } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();

  return (
    <AntHeader style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ color: 'white', margin: 0, cursor: 'pointer' }} onClick={() => void navigate('/')}>
          Song Learning
        </h1>
      </div>
      <MenuOutlined style={{ fontSize: 24, color: 'white' }} />
    </AntHeader>
  );
};

export default Header;
