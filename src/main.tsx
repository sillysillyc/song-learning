import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { store, persistor } from '@/store';
import { ConfigProvider, Spin, type ThemeConfig } from 'antd';
import App from './App.tsx';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import './index.css';
import { useState } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
const Root = () => {
  const [theme] = useState<ThemeConfig>({
    token: {},
    components: {
      Layout: {},
    },
  });
  return (
    <Provider store={store}>
      <PersistGate loading={<Spin spinning />} persistor={persistor}>
        <ConfigProvider locale={zhCN} theme={theme}>
          <App />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

createRoot(document.getElementById('root')!).render(<Root />);
