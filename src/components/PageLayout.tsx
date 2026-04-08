import { Card } from 'antd';
import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageLayoutProps {
  children?: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return <Card style={{ width: '100%' }}>{children || <Outlet />}</Card>;
};

export default PageLayout;
