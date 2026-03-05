import { createBrowserRouter, RouterProvider, Navigate, useParams } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';
import { store } from './store/store';
import type { AppDispatch, RootState } from './store/store';
import { setCredentials, logout } from './store/slices/authSlice';
import apiClient from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Coaches from './pages/Coaches';
import CoachDetail from './pages/CoachDetailPage';
import Profile from './pages/Profile';
import ProgramsPage from './pages/ProgramsPage';
import MessagesPage from './pages/MessagesPage';
import WorkoutsPage from './pages/WorkoutsPage';


// Gym Module Pages
import Gyms from './pages/Gyms';
import GymDetailPage from './pages/GymDetailPage';
import GymRegisterPage from './pages/GymRegisterPage';
import GymOwnerDashboard from './pages/GymOwnerDashboard';

// Legal & Community Pages
import AboutPage from './pages/legal/AboutPage';
import CommunityStandardsPage from './pages/legal/CommunityStandardsPage';
import GuidelinesPage from './pages/legal/GuidelinesPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import FAQPage from './pages/legal/FAQPage';
import ContactPage from './pages/legal/ContactPage';
import CoachGuidePage from './pages/legal/CoachGuidePage';
import PaymentPolicyPage from './pages/legal/PaymentPolicyPage';
import ReportPage from './pages/legal/ReportPage';


// Sprint 2: Redirect component for legacy /trainer/:id URLs
function TrainerRedirect() {
  const { trainerId } = useParams();
  return <Navigate to={`/coaches/${trainerId}`} replace />;
}

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: '/coaches', element: <Coaches /> },
      { path: '/coaches/:trainerId', element: <CoachDetail /> },
      { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: '/programs', element: <ProtectedRoute requiredRole={['trainer', 'athlete']}><ProgramsPage /></ProtectedRoute> },
      { path: '/messages', element: <ProtectedRoute><MessagesPage /></ProtectedRoute> },
      { path: '/workouts', element: <ProtectedRoute requiredRole="athlete"><WorkoutsPage /></ProtectedRoute> },
      // Sprint 2: /trainer/:trainerId redirects to canonical /coaches/:trainerId (merge duplicate routes)
      { path: '/trainer/:trainerId', element: <TrainerRedirect /> },

      // Gym Module Routes
      { path: '/gyms', element: <Gyms /> },
      { path: '/gyms/:id', element: <GymDetailPage /> },
      { path: '/gym-owner/register', element: <ProtectedRoute requiredRole="gym_owner"><GymRegisterPage /></ProtectedRoute> },
      { path: '/gym-owner', element: <ProtectedRoute requiredRole="gym_owner"><GymOwnerDashboard /></ProtectedRoute> },

      // Legal & Community Routes
      { path: '/about', element: <AboutPage /> },
      { path: '/community-standards', element: <CommunityStandardsPage /> },
      { path: '/guidelines', element: <GuidelinesPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/faq', element: <FAQPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/coach-guide', element: <CoachGuidePage /> },
      { path: '/payment-policy', element: <PaymentPolicyPage /> },
      { path: '/report', element: <ReportPage /> },
    ]
  }
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
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthRestorer>
            <RouterProvider router={router} />
          </AuthRestorer>
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;
