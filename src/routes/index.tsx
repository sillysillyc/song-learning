import { type RouteObject } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { SongDetail } from '@/pages/SongDetail';
import PageLayout from '@/components/PageLayout';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: 'song',
    element: (
      <PageLayout>
        <SongDetail />
      </PageLayout>
    ),
  },
];
