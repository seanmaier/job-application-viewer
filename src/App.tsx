import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationPage } from './pages/ApplicationPage';
import { NewApplicationPage } from './pages/NewApplicationPage';

const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/application/new', element: <NewApplicationPage /> },
  { path: '/application/:id', element: <ApplicationPage /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
