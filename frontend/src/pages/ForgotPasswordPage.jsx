import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "../store/authStore";
import CustomInput from "../components/CustomInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { forgotPasswordSchema } from "../schema/authSchema";

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, forgotPassword, error, resetAll } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const email = watch("email");

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success("Reset link sent! Please check your email.");
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    }
  };

  useEffect(() => {
    resetAll();
  }, [resetAll]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-black/30 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-amber-400 to-rose-500 text-transparent bg-clip-text">
          Forgot Password
        </h2>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="text-gray-200 mb-6 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <CustomInput
              icon={Mail}
              type="email"
              placeholder="Email Address"
              error={errors.email?.message}
              {...register("email")}
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Loader className="size-6 animate-spin mx-auto" /> : "Send Reset Link"}
            </motion.button>
          </form>
        ) : (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-16 h-16 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>
            <p className="text-gray-300 mb-6">
              If an account exists for {email}, you will receive a password reset link shortly.
            </p>
          </div>
        )}
      </div>

      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <Link to={"/sign-in"} className="text-sm text-orange-400 hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
        </Link>
      </div>
    </motion.div>
  );
};
export default ForgotPasswordPage;
