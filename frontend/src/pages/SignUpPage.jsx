import { motion } from "framer-motion"
import CustomInput from "../components/CustomInput"
import { Mail, User, Lock, Loader } from "lucide-react"
import { useEffect } from "react"
import { Link, useNavigate } from "react-router"
import PasswordStrengthMeter from "../components/PasswordStrengthMeter"
import { useAuthStore } from "../store/authStore"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { signUpSchema } from "../schema/authSchema"
import SocialLoginButtons from "../components/SocialLoginButtons"

const SignUpPage = () => {
  const navigate = useNavigate()
  const { signup, error, isLoading, resetState } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  const onSubmit = async (data) => {
    try {
      await signup(data.email, data.password, data.name)
      toast.success("Account created successfully! Please verify your email.")
      navigate("/verify")
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    resetState()
  }, [resetState])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-black/30 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-amber-400 to-rose-500 text-transparent bg-clip-text">
          Create Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            icon={User}
            type="text"
            placeholder="Full Name"
            error={errors.name?.message}
            {...register("name")}
          />

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

          <CustomInput
            icon={Lock}
            type="password"
            placeholder="Confirm Password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}

          <PasswordStrengthMeter password={password} />

          <motion.button
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin mx-auto" size={24} /> : "Sign Up"}
          </motion.button>
        </form>

        <SocialLoginButtons />
      </div>
      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link to={"/sign-in"} className="text-orange-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default SignUpPage
