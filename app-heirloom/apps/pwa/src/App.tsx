import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Record from './pages/Record';
import RecordText from './pages/RecordText';
import RecordVideo from './pages/RecordVideo';
import UploadPhoto from './pages/UploadPhoto';
import Vault from './pages/Vault';
import Story from './pages/Story';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import FamilyVault from './pages/FamilyVault';
import FamilyTree from './pages/FamilyTree';
import InviteFamily from './pages/InviteFamily';
import TabBar from './components/TabBar';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-script text-4xl text-heritage-green mb-2">Heirloom</h1>
          <p className="text-charcoal-ink/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-script text-4xl text-heritage-green mb-2">Heirloom</h1>
          <p className="text-charcoal-ink/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/record"
          element={
            <ProtectedRoute>
              <Record />
            </ProtectedRoute>
          }
        />
        <Route
          path="/record/text"
          element={
            <ProtectedRoute>
              <RecordText />
            </ProtectedRoute>
          }
        />
        <Route
          path="/record/video"
          element={
            <ProtectedRoute>
              <RecordVideo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/record/photo"
          element={
            <ProtectedRoute>
              <UploadPhoto />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <Vault />
            </ProtectedRoute>
          }
        />
        <Route
          path="/story/:id"
          element={
            <ProtectedRoute>
              <Story />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <FamilyVault />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family/invite"
          element={
            <ProtectedRoute>
              <InviteFamily />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family/tree"
          element={
            <ProtectedRoute>
              <FamilyTree />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tree"
          element={
            <ProtectedRoute>
              <FamilyTree />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Tab bar - only show when logged in and not on record/story pages */}
      {user && <TabBar />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
