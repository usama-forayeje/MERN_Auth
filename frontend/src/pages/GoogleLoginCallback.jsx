import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const GoogleLoginCallback = () => {
  const { provider } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { googleLoginCallback, error, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const query = new URLSearchParams(search);
      const token = query.get("token");

      if (!provider) {
        toast.error("No provider specified in route.");
        return navigate("/sign-up");
      }

      if (!token) {
        toast.error("Authentication failed. No token found in URL.");
        return navigate("/sign-up");
      }
      try {
        await googleLoginCallback(provider, token);
        toast.success(`✅ Logged in with ${provider}`);
        navigate("/");
      } catch (err) {
        console.error("❌ Social login error:", err);
        toast.error(error || "Authentication failed. Please try again.");
        navigate("/sign-in");
      }
    };

    // Prevent re-authentication if already logged in
    if (!isAuthenticated) {
      handleCallback();
    } else {
      navigate("/");
    }
  }, [provider, search, googleLoginCallback, error, isAuthenticated, navigate]);

  return <LoadingSpinner />;
};

export default GoogleLoginCallback;
