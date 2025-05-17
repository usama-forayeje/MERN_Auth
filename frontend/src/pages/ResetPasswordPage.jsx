import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import CustomInput from "../components/CustomInput";
import { useAuthStore } from "../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../schema/authSchema";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, error, isLoading, message, resetAll } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await resetPassword(token, data.password);
      toast.success("Password reset successfully, redirecting to login page...");
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error resetting password");
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
          Reset Password
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            icon={Lock}
            type="password"
            placeholder="New Password"
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordStrengthMeter password={password} />

          <CustomInput
            icon={Lock}
            type="password"
            placeholder="Confirm New Password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Set New Password"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};
export default ResetPasswordPage;
