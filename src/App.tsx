import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from '@/layouts/Layout';
import { routes } from '@/routes';
import './App.less';
import { memo, useMemo } from 'react';

const App = memo(() => {
  const routesRenderer = useMemo(
    () =>
      routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element}>
          {route.children &&
            route.children.map((child) => <Route key={child.path} path={child.path} element={child.element} />)}
        </Route>
      )),
    [routes],
  );

  return (
    <Router>
      <Layout>
        <Routes>{routesRenderer}</Routes>
      </Layout>
    </Router>
  );
});

export default App;
