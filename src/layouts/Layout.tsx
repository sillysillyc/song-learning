import { Layout as AntLayout } from 'antd';
import Header from '@components/Header';
import Footer from '@components/Footer';
import type { PropsWithChildren } from 'react';

const { Content } = AntLayout;

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <AntLayout style={{ height: '100%' }}>
      <Header />
      <Content style={{ padding: '24px', overflowY: 'scroll' }}>{children}</Content>
      <Footer />
    </AntLayout>
  );
};

export default Layout;
