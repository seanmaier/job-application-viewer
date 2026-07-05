import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationPage } from './pages/ApplicationPage';

const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/application/:id', element: <ApplicationPage /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
