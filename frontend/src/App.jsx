import { Navigate, Route, Routes } from "react-router";
import FloatingShape from "./components/ui/FloatingShape";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import LoadingSpinner from "./components/LoadingSpinner";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./store/userStore";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify" replace />;
  }

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useUserStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isCheckingAuth, profile } = useUserStore();

  useEffect(() => {
    profile();
  }, [profile]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div
      className="min-h-screen bg-gradient-to-br   
     from-[#e46525b0] via-[#d5262971] to-[#d526296c] flex items-center justify-center relative overflow-hidden"
    >
      <FloatingShape color="bg-[#D5262A]" size="w-64 h-64" top="-5%" left="10%" delay={0} />
      <FloatingShape color="bg-[#D5262A]" size="w-48 h-48" top="70%" left="80%" delay={5} />
      <FloatingShape color="bg-[#D5262A]" size="w-32 h-32" top="40%" left="-10%" delay={2} />

      <Routes>
        {/* <Route path="/" element={"Home"} /> */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
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
          path="/reset-password"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/verify" element={<EmailVerificationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
