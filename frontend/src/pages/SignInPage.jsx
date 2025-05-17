import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Loader, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "../schema/authSchema";
import CustomInput from "../components/CustomInput";
import SocialLoginButtons from "../components/SocialLoginButtons";

function SignInPage() {
  const navigate = useNavigate();
  const { signin, isLoading, error, user, resetState } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await signin(data.email, data.password);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    resetState();
  }, [resetState]);

  useEffect(() => {
    if (user && user.isEmailVerified) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-black/30 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-amber-400 to-rose-500 text-transparent bg-clip-text">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            icon={Mail}
            type="email"
            placeholder="Email Address"
            error={errors.email?.message}
            {...register("email")}
          />

          <CustomInput
            icon={Lock}
            type="password"
            placeholder="Password"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center mb-6">
            <Link to="/forgot-password" className="text-sm text-orange-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-500 font-semibold mb-2">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Login"}
          </motion.button>
        </form>

        <SocialLoginButtons />
      </div>
      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/sign-up" className="text-orange-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default SignInPage;
