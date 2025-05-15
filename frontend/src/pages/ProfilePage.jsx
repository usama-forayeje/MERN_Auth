import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomInput from "../components/CustomInput";
import { User, Mail, Phone, MapPin, Loader, Save } from "lucide-react";
import toast from "react-hot-toast";
import AvatarUpload from "../components/AvatarUpload";
import { profileSchema } from "../schema/authSchema";

const ProfilePage = () => {
  const { user, updateProfile, isLoading, error, message, resetState } = useAuthStore();
  const [avatarFile, setAvatarFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      gender: user?.gender || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "",
      });
    }
  }, [user, reset]);

  useEffect(() => {
    resetState();
  }, [resetState]);

  const onSubmit = async (data) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", data.name);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (data.phoneNumber) {
        formData.append("phoneNumber", data.phoneNumber);
      }

      if (data.gender) {
        formData.append("gender", data.gender);
      }

      await updateProfile(formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl w-full mx-auto p-8 
      bg-black/30 backdrop-blur-md 
      rounded-2xl shadow-2xl border border-orange-900/30"
    >
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-amber-400 to-rose-500 text-transparent bg-clip-text">
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center mb-6">
          <AvatarUpload
            currentAvatar={user?.avatar}
            onAvatarChange={handleAvatarChange}
            userName={user?.name}
          />
        </div>

        {message && <p className="text-green-500 text-sm text-center">{message}</p>}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CustomInput
              icon={User}
              type="text"
              placeholder="Full Name"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>

          <div>
            <CustomInput
              icon={Mail}
              type="email"
              placeholder="Email Address"
              error={errors.email?.message}
              disabled
              {...register("email")}
            />
          </div>

          <div>
            <CustomInput
              icon={Phone}
              type="tel"
              placeholder="Phone Number"
              error={errors.phoneNumber?.message}
              {...register("phoneNumber")}
            />
          </div>

          <div className="relative mb-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
            <select
              {...register("gender")}
              className="w-full px-3 py-2 bg-gray-800/50 rounded-lg border border-orange-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 text-white transition duration-200"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 flex items-center justify-center gap-2"
          type="submit"
          disabled={isLoading || (!isDirty && !avatarFile)}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Update Profile
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ProfilePage;
