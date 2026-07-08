import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationPage } from './pages/ApplicationPage';
import { NewApplicationPage } from './pages/NewApplicationPage';
import { EditApplicationPage } from './pages/EditApplicationPage';
import { ProfilePage } from './pages/ProfilePage';

const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/application/new', element: <NewApplicationPage /> },
  { path: '/application/:id/edit', element: <EditApplicationPage /> },
  { path: '/application/:id', element: <ApplicationPage /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
