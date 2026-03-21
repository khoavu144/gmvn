import { createBrowserRouter, RouterProvider, Navigate, useParams, useRouteError, isRouteErrorResponse, useLocation, useNavigationType } from 'react-router-dom';
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

type LazyModule<TProps = Record<string, unknown>> = {
  default: React.ComponentType<TProps>;
};

const lazyWithChunkRetry = <TProps extends Record<string, unknown> = Record<string, unknown>>(
  importer: () => Promise<LazyModule<TProps>>,
  chunkKey: string,
) => lazy(async () => {
  try {
    const mod = await importer();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`lazy-chunk-reload:${chunkKey}`);
    }
    return mod;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isDynamicImportError = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk [\d]+ failed/i.test(message);

    if (isDynamicImportError && typeof window !== 'undefined') {
      const reloadKey = `lazy-chunk-reload:${chunkKey}`;
      const alreadyReloaded = sessionStorage.getItem(reloadKey) === '1';

      // eslint-disable-next-line no-console
      console.warn('[lazy-chunk-retry] dynamic import failed', {
        chunkKey,
        message,
        alreadyReloaded,
        reloadKey,
        href: window.location.href,
      });

      if (!alreadyReloaded) {
        sessionStorage.setItem(reloadKey, '1');
        // eslint-disable-next-line no-console
        console.warn('[lazy-chunk-retry] forcing hard reload to recover chunk mismatch', {
          chunkKey,
          href: window.location.href,
        });
        window.location.reload();
      }
    }

    // eslint-disable-next-line no-console
    console.warn('[lazy-chunk-retry] rethrowing import error', { chunkKey, message });
    throw error;
  }
});

const Home = lazyWithChunkRetry(() => import('./pages/Home'), 'home');
const Login = lazyWithChunkRetry(() => import('./pages/Login'), 'login');
const Register = lazyWithChunkRetry(() => import('./pages/Register'), 'register');
const OnboardingPage = lazyWithChunkRetry(() => import('./pages/OnboardingPage'), 'onboarding');
const VerifyEmail = lazyWithChunkRetry(() => import('./pages/VerifyEmail'), 'verify-email');
const ForgotPassword = lazyWithChunkRetry(() => import('./pages/ForgotPassword'), 'forgot-password');
const ResetPassword = lazyWithChunkRetry(() => import('./pages/ResetPassword'), 'reset-password');
const SubscriptionsPage = lazyWithChunkRetry(() => import('./pages/SubscriptionsPage'), 'subscriptions');

const Dashboard = lazyWithChunkRetry(() => import('./pages/Dashboard'), 'dashboard');
const Coaches = lazyWithChunkRetry(() => import('./pages/Coaches'), 'coaches');
const CoachDetail = lazyWithChunkRetry(() => import('./pages/CoachDetailPage'), 'coach-detail');
const AthleteDetailPage = lazyWithChunkRetry(() => import('./pages/AthleteDetailPage'), 'athlete-detail');
const Profile = lazyWithChunkRetry(() => import('./pages/Profile'), 'profile');
// ProfilePublic intentionally removed from routing — deprecated in favour of CoachDetailPage

const ProgramsPage = lazyWithChunkRetry(() => import('./pages/ProgramsPage'), 'programs');
const MessagesPage = lazyWithChunkRetry(() => import('./pages/MessagesPage'), 'messages');
const WorkoutsPage = lazyWithChunkRetry(() => import('./pages/WorkoutsPage'), 'workouts');

const Gyms = lazyWithChunkRetry(() => import('./pages/Gyms'), 'gyms');
const GymDetailPage = lazyWithChunkRetry(() => import('./pages/GymDetailPage'), 'gym-detail');
const GymRegisterPage = lazyWithChunkRetry(() => import('./pages/GymRegisterPage'), 'gym-register');
const GymOwnerDashboard = lazyWithChunkRetry(() => import('./pages/GymOwnerDashboard'), 'gym-owner-dashboard');
const CommunityGallery = lazyWithChunkRetry(() => import('./pages/CommunityGallery'), 'community-gallery');
const PricingPage = lazyWithChunkRetry(() => import('./pages/PricingPage'), 'pricing');
const MarketplacePage = lazyWithChunkRetry(() => import('./pages/MarketplacePage'), 'marketplace');
const ProductDetailPage = lazyWithChunkRetry(() => import('./pages/ProductDetailPage'), 'product-detail');
const NewsPage = lazyWithChunkRetry(() => import('./pages/NewsPage'), 'news');
const NewsDetailPage = lazyWithChunkRetry(() => import('./pages/NewsDetailPage'), 'news-detail');

const AboutPage = lazyWithChunkRetry(() => import('./pages/legal/AboutPage'), 'about');
const CommunityStandardsPage = lazyWithChunkRetry(() => import('./pages/legal/CommunityStandardsPage'), 'community-standards');
const GuidelinesPage = lazyWithChunkRetry(() => import('./pages/legal/GuidelinesPage'), 'guidelines');
const PrivacyPage = lazyWithChunkRetry(() => import('./pages/legal/PrivacyPage'), 'privacy');
const TermsPage = lazyWithChunkRetry(() => import('./pages/legal/TermsPage'), 'terms');
const FAQPage = lazyWithChunkRetry(() => import('./pages/legal/FAQPage'), 'faq');
const ContactPage = lazyWithChunkRetry(() => import('./pages/legal/ContactPage'), 'contact');
const CoachGuidePage = lazyWithChunkRetry(() => import('./pages/legal/CoachGuidePage'), 'coach-guide');
const PaymentPolicyPage = lazyWithChunkRetry(() => import('./pages/legal/PaymentPolicyPage'), 'payment-policy');
const ReportPage = lazyWithChunkRetry(() => import('./pages/legal/ReportPage'), 'report');


// Sprint 2: Redirect component for legacy /trainer/:id URLs
function TrainerRedirect() {
  const { trainerId } = useParams();
  return <Navigate to={`/coaches/${trainerId}`} replace />;
}

// SEO redirect: /athletes/:identifier → /athlete/:identifier (canonical)
function AthletesRedirect() {
  const { identifier } = useParams();
  return <Navigate to={`/athlete/${identifier}`} replace />;
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

const RouteFallback = () => {
  const location = useLocation();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn('[route-fallback] suspense fallback visible', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      href: window.location.href,
      ts: new Date().toISOString(),
    });
  }, [location.pathname, location.search, location.hash]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" />
    </div>
  );
};

const lazyRoute = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>
    {element}
  </Suspense>
);

const RouteErrorFallback = () => {
  const error = useRouteError();
  const rawMessage =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : 'Đã xảy ra lỗi không xác định';

  const isChunkError = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk [\d]+ failed/i.test(rawMessage);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">GYMERVIET</p>
        <h1 className="mt-4 text-2xl font-bold text-black tracking-tight">
          {isChunkError ? 'Ứng dụng vừa cập nhật, vui lòng tải lại trang' : 'Không thể tải trang này'}
        </h1>
        <p className="mt-3 text-sm text-gray-600 leading-6">
          {isChunkError
            ? 'Có thể trình duyệt đang giữ file JavaScript cũ sau khi deploy. Hãy reload để đồng bộ phiên bản mới nhất.'
            : rawMessage}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Tải lại trang
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

function RouteDiagnostics() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn('[route-diagnostics] navigation event', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      navigationType,
      href: window.location.href,
      ts: new Date().toISOString(),
    });
  }, [location.pathname, location.search, location.hash, navigationType]);

  return null;
}

const router = createBrowserRouter([
  {
    element: (
      <>
        <RouteDiagnostics />
        <MainLayout />
      </>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      { path: '/', element: lazyRoute(<Home />) },
      { path: '/login', element: lazyRoute(<Login />) },
      { path: '/register', element: lazyRoute(<Register />) },
      { path: '/onboarding', element: lazyRoute(<ProtectedRoute><OnboardingPage /></ProtectedRoute>) },
      { path: '/verify-email', element: lazyRoute(<ProtectedRoute><VerifyEmail /></ProtectedRoute>) },
      { path: '/forgot-password', element: lazyRoute(<ForgotPassword />) },
      { path: '/reset-password', element: lazyRoute(<ResetPassword />) },
      { path: '/dashboard', element: lazyRoute(<ProtectedRoute><Dashboard /></ProtectedRoute>) },
      { path: '/dashboard/subscriptions', element: lazyRoute(<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>) },
      { path: '/coaches', element: lazyRoute(<Coaches />) },
      { path: '/coaches/:trainerId', element: lazyRoute(<CoachDetail />) },
      // SEO permalink route: fallback to coach detail by slug when public CV profile is not available
      { path: '/coach/:slug', element: lazyRoute(<CoachDetail />) },
      // Athlete SEO permalink route (parity with /coach/:slug)
      { path: '/athlete/:slug', element: lazyRoute(<AthleteDetailPage />) },
      // Redirect /athletes/:identifier → /athlete/:identifier for SEO
      { path: '/athletes/:identifier', element: <AthletesRedirect /> },
      { path: '/profile', element: lazyRoute(<ProtectedRoute><Profile /></ProtectedRoute>) },
      { path: '/programs', element: lazyRoute(<ProtectedRoute requiredRole={['trainer', 'athlete']}><ProgramsPage /></ProtectedRoute>) },
      { path: '/messages', element: lazyRoute(<ProtectedRoute><MessagesPage /></ProtectedRoute>) },
      { path: '/workouts', element: lazyRoute(<ProtectedRoute requiredRole="athlete"><WorkoutsPage /></ProtectedRoute>) },
      // Sprint 2: /trainer/:trainerId redirects to canonical /coaches/:trainerId (merge duplicate routes)
      { path: '/trainer/:trainerId', element: lazyRoute(<TrainerRedirect />) },
      { path: '/gallery', element: lazyRoute(<CommunityGallery />) },
      { path: '/pricing', element: lazyRoute(<PricingPage />) },

      // Gym Module Routes
      { path: '/gyms', element: lazyRoute(<Gyms />) },
      // BUG FIX: /gyms/:idOrSlug — backend detects UUID vs slug transparently
      { path: '/gyms/:id', element: lazyRoute(<GymDetailPage />) },
      { path: '/gym-owner/register', element: lazyRoute(<ProtectedRoute requiredRole="gym_owner"><GymRegisterPage /></ProtectedRoute>) },
      { path: '/gym-owner', element: lazyRoute(<ProtectedRoute requiredRole="gym_owner"><GymOwnerDashboard /></ProtectedRoute>) },

      // Marketplace Routes
      { path: '/marketplace', element: lazyRoute(<MarketplacePage />) },
      { path: '/marketplace/product/:slug', element: lazyRoute(<ProductDetailPage />) },

      // News Routes
      { path: '/news', element: lazyRoute(<NewsPage />) },
      { path: '/news/:slug', element: lazyRoute(<NewsDetailPage />) },

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
