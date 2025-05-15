import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const SocialLoginCallback = () => {
  const { provider } = useParams();
  const navigate = useNavigate();
  const { socialLoginCallback, error } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
          throw new Error("Authentication failed. No token received.");
        }

        // Process the social login
        await socialLoginCallback(provider, token);

        // Redirect to dashboard on success
        toast.success(`Successfully logged in with ${provider}`);
        navigate("/");
      } catch (err) {
        console.error("Social login error:", err);
        toast.error(error || "Authentication failed. Please try again.");
        navigate("/sign-in");
      }
    };

    handleCallback();
  }, [provider, navigate, socialLoginCallback, error]);

  return <LoadingSpinner />;
};

export default SocialLoginCallback;
