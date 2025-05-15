import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomInput from "../components/CustomInput";
import { Lock, Loader, Save } from "lucide-react";
import toast from "react-hot-toast";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { changePasswordSchema } from "../schema/authSchema";

const ChangePasswordPage = () => {
  const { changePassword, isLoading, error, message, resetState } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  useEffect(() => {
    resetState();
  }, [resetState]);

  const onSubmit = async (data) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success("Password changed successfully");
      reset();
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl w-full mx-auto p-8 
      bg-black/30 backdrop-blur-md 
      rounded-2xl shadow-2xl border border-orange-900/30"
    >
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-amber-400 to-rose-500 text-transparent bg-clip-text">
        Change Password
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <CustomInput
          icon={Lock}
          type="password"
          placeholder="Current Password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />

        <CustomInput
          icon={Lock}
          type="password"
          placeholder="New Password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordStrengthMeter password={newPassword} />

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
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 flex items-center justify-center gap-2"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Change Password
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ChangePasswordPage;
