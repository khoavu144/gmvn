import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { store } from './store/store';
import type { AppDispatch, RootState } from './store/store';
import { setCredentials, logout } from './store/slices/authSlice';
import apiClient from './services/api';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trainers from './pages/Trainers';
import Profile from './pages/Profile';
import TrainerDetailPage from './pages/TrainerDetailPage';
import ProgramsPage from './pages/ProgramsPage';
import MessagesPage from './pages/MessagesPage';
import WorkoutsPage from './pages/WorkoutsPage';
import ProfilePublic from './pages/ProfilePublic';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/trainers', element: <Trainers /> },
  { path: '/trainers/:trainerId', element: <TrainerDetailPage /> },
  { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '/programs', element: <ProtectedRoute requiredRole="trainer"><ProgramsPage /></ProtectedRoute> },
  { path: '/messages', element: <ProtectedRoute><MessagesPage /></ProtectedRoute> },
  { path: '/workouts', element: <ProtectedRoute requiredRole="athlete"><WorkoutsPage /></ProtectedRoute> },
  // Public trainer profile landing page (slug or trainerId)
  { path: '/trainer/:trainerId', element: <ProfilePublic /> },
]);

function AuthRestorer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Nếu có token nhưng không có user → fetch lại user
    if (accessToken && !user) {
      apiClient.get('/auth/me')
        .then(res => {
          // Re-set credentials (giữ token từ localStorage)
          const refresh = localStorage.getItem('refresh_token') || '';
          dispatch(setCredentials({
            user: res.data.data,
            access_token: accessToken,
            refresh_token: refresh,
          }));
        })
        .catch(() => {
          // Token hết hạn hoặc invalid → logout
          dispatch(logout());
        });
    }
  }, [accessToken, user, dispatch]);

  return <>{children}</>;
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthRestorer>
          <RouterProvider router={router} />
        </AuthRestorer>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
