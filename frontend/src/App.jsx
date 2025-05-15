import { Navigate, Route, Routes } from "react-router";
import FloatingShape from "./components/ui/FloatingShape";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import LoadingSpinner from "./components/LoadingSpinner";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import AppLayout from "./components/AppLayout";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import SocialLoginCallback from "./pages/SocialLoginCallback";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!user || !isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!user?.isEmailVerified) {
    return <Navigate to="/verify" replace />;
  }

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.isEmailVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isCheckingAuth, profile } = useAuthStore();

  useEffect(() => {
    profile();
  }, [profile]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 flex items-center justify-center relative overflow-hidden">
      <FloatingShape color="bg-amber-500" size="w-64 h-64" top="-5%" left="10%" delay={0} />
      <FloatingShape color="bg-rose-500" size="w-48 h-48" top="70%" left="80%" delay={5} />
      <FloatingShape color="bg-orange-500" size="w-32 h-32" top="40%" left="-10%" delay={2} />

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ChangePasswordPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="sign-up"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/sign-in"
          element={
            <RedirectAuthenticatedUser>
              <SignInPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/verify" element={<EmailVerificationPage />} />
        <Route path="/auth/callback/:provider" element={<SocialLoginCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
