import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'

const prewarmInitialRouteChunk = () => {
  if (typeof window === 'undefined') return
  const path = window.location.pathname

  if (path === '/') {
    void import('./pages/Home')
    return
  }

  if (path.startsWith('/coaches')) {
    void import('./pages/Coaches')
    return
  }

  if (path.startsWith('/coach/')) {
    void import('./pages/CoachDetailPage')
    return
  }

  if (path.startsWith('/gyms')) {
    if (path === '/gyms') {
      void import('./pages/Gyms')
    } else {
      void import('./pages/GymDetailPage')
    }
    return
  }

  if (path.startsWith('/marketplace')) {
    if (path.includes('/product/')) {
      void import('./pages/ProductDetailPage')
    } else {
      void import('./pages/MarketplacePage')
    }
    return
  }

  if (path.startsWith('/pricing')) {
    void import('./pages/PricingPage')
    return
  }

  if (path.startsWith('/gallery')) {
    void import('./pages/CommunityGallery')
  }
}

prewarmInitialRouteChunk()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary scope="ứng dụng">
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
