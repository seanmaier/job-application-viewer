import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationPage } from './pages/ApplicationPage';
import { NewApplicationPage } from './pages/NewApplicationPage';
import { EditApplicationPage } from './pages/EditApplicationPage';
import { BaseProfilesPage } from './pages/BaseProfilesPage';
import { BaseProfileEditPage } from './pages/BaseProfileEditPage';

const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/profiles', element: <BaseProfilesPage /> },
  { path: '/profiles/:id', element: <BaseProfileEditPage /> },
  { path: '/application/new', element: <NewApplicationPage /> },
  { path: '/application/:id/edit', element: <EditApplicationPage /> },
  { path: '/application/:id', element: <ApplicationPage /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
