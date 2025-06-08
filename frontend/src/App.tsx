import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

// Import layout component (we'll create a basic one if it doesn't exist)
const MainLayout = lazy(() => import('./components/layout/MainLayout'));

// Import pages
const Login = lazy(() => import('./pages/Auth/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Projects = lazy(() => import('./pages/Projects/Projects'));
const Forecasts = lazy(() => import('./pages/Forecasts/Forecasts'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const Users = lazy(() => import('./pages/Users/Users'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Mock auth check (replace with actual auth logic)
const isAuthenticated = () => {
  // Check if user is authenticated (e.g., check token in localStorage)
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = isAuthenticated();
  return auth ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="forecasts" element={<Forecasts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={<Users />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#059669',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#DC2626',
              },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;