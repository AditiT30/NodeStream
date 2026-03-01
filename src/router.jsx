import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Body from './components/Body.jsx';
import VideoPage from './pages/VideoPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Body /> },
      { path: 'video/:id', element: <VideoPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
    ],
  },
]);
