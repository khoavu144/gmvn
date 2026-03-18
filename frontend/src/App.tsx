import { createBrowserRouter, RouterProvider, Navigate, useParams } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { store } from './store/store';
import type { AppDispatch, RootState } from './store/store';
import { setCredentials, logout } from './store/slices/authSlice';
import apiClient from './services/api';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Coaches = lazy(() => import('./pages/Coaches'));
const CoachDetail = lazy(() => import('./pages/CoachDetailPage'));
const AthleteDetailPage = lazy(() => import('./pages/AthleteDetailPage'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfilePublic = lazy(() => import('./pages/ProfilePublic'));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const WorkoutsPage = lazy(() => import('./pages/WorkoutsPage'));

const Gyms = lazy(() => import('./pages/Gyms'));
const GymDetailPage = lazy(() => import('./pages/GymDetailPage'));
const GymRegisterPage = lazy(() => import('./pages/GymRegisterPage'));
const GymOwnerDashboard = lazy(() => import('./pages/GymOwnerDashboard'));

const AboutPage = lazy(() => import('./pages/legal/AboutPage'));
const CommunityStandardsPage = lazy(() => import('./pages/legal/CommunityStandardsPage'));
const GuidelinesPage = lazy(() => import('./pages/legal/GuidelinesPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const FAQPage = lazy(() => import('./pages/legal/FAQPage'));
const ContactPage = lazy(() => import('./pages/legal/ContactPage'));
const CoachGuidePage = lazy(() => import('./pages/legal/CoachGuidePage'));
const PaymentPolicyPage = lazy(() => import('./pages/legal/PaymentPolicyPage'));
const ReportPage = lazy(() => import('./pages/legal/ReportPage'));


// Sprint 2: Redirect component for legacy /trainer/:id URLs
function TrainerRedirect() {
  const { trainerId } = useParams();
  return <Navigate to={`/coaches/${trainerId}`} replace />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" />
  </div>
);

const lazyRoute = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>
    {element}
  </Suspense>
);

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: lazyRoute(<Home />) },
      { path: '/login', element: lazyRoute(<Login />) },
      { path: '/register', element: lazyRoute(<Register />) },
      { path: '/dashboard', element: lazyRoute(<ProtectedRoute><Dashboard /></ProtectedRoute>) },
      { path: '/coaches', element: lazyRoute(<Coaches />) },
      { path: '/coaches/:trainerId', element: lazyRoute(<CoachDetail />) },
      // SEO permalink route: fallback to coach detail by slug when public CV profile is not available
      { path: '/coach/:slug', element: lazyRoute(<CoachDetail />) },
      { path: '/profile/public/:trainerId', element: lazyRoute(<ProfilePublic />) },
      { path: '/athletes/:identifier', element: lazyRoute(<AthleteDetailPage />) },
      { path: '/profile', element: lazyRoute(<ProtectedRoute><Profile /></ProtectedRoute>) },
      { path: '/programs', element: lazyRoute(<ProtectedRoute requiredRole={['trainer', 'athlete']}><ProgramsPage /></ProtectedRoute>) },
      { path: '/messages', element: lazyRoute(<ProtectedRoute><MessagesPage /></ProtectedRoute>) },
      { path: '/workouts', element: lazyRoute(<ProtectedRoute requiredRole="athlete"><WorkoutsPage /></ProtectedRoute>) },
      // Sprint 2: /trainer/:trainerId redirects to canonical /coaches/:trainerId (merge duplicate routes)
      { path: '/trainer/:trainerId', element: lazyRoute(<TrainerRedirect />) },

      // Gym Module Routes
      { path: '/gyms', element: lazyRoute(<Gyms />) },
      // BUG FIX: /gyms/:idOrSlug — backend detects UUID vs slug transparently
      { path: '/gyms/:id', element: lazyRoute(<GymDetailPage />) },
      { path: '/gym-owner/register', element: lazyRoute(<ProtectedRoute requiredRole="gym_owner"><GymRegisterPage /></ProtectedRoute>) },
      { path: '/gym-owner', element: lazyRoute(<ProtectedRoute requiredRole="gym_owner"><GymOwnerDashboard /></ProtectedRoute>) },

      // Legal & Community Routes
      { path: '/about', element: lazyRoute(<AboutPage />) },
      { path: '/community-standards', element: lazyRoute(<CommunityStandardsPage />) },
      { path: '/guidelines', element: lazyRoute(<GuidelinesPage />) },
      { path: '/privacy', element: lazyRoute(<PrivacyPage />) },
      { path: '/terms', element: lazyRoute(<TermsPage />) },
      { path: '/faq', element: lazyRoute(<FAQPage />) },
      { path: '/contact', element: lazyRoute(<ContactPage />) },
      { path: '/coach-guide', element: lazyRoute(<CoachGuidePage />) },
      { path: '/payment-policy', element: lazyRoute(<PaymentPolicyPage />) },
      { path: '/report', element: lazyRoute(<ReportPage />) },
    ]
  }
]);


function AuthRestorer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, user } = useSelector((state: RootState) => state.auth);
  const isRestoringRef = useRef(false);

  useEffect(() => {
    const handleStorage = () => {
      const currentToken = localStorage.getItem('access_token');
      if (!currentToken && accessToken) {
        dispatch(logout());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (!accessToken || user || isRestoringRef.current) {
      return;
    }

    let isMounted = true;
    isRestoringRef.current = true;

    apiClient.get('/auth/me')
      .then(res => {
        if (!isMounted) {
          return;
        }

        const refresh = localStorage.getItem('refresh_token') || '';
        dispatch(setCredentials({
          user: res.data.data,
          access_token: accessToken,
          refresh_token: refresh,
        }));
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        dispatch(logout());
      })
      .finally(() => {
        isRestoringRef.current = false;
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, user, dispatch]);

  return <>{children}</>;
}

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary scope="điều hướng">
            <AuthRestorer>
              <RouterProvider router={router} />
            </AuthRestorer>
          </ErrorBoundary>
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;
