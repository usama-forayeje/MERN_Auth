import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Loader, Lock, Mail } from "lucide-react";
import CustomInput from "../components/customInput";
import { motion } from "framer-motion";
import { Link } from "react-router";
import toast from "react-hot-toast";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signin, isLoading, error,user } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    await signin(email, password);
  };

  useEffect(() => {
  if (user) {
    toast.success(`Welcome ${user.name}!`);
  }
}, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-[#e4652553] bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-600 to-orange-800 text-transparent bg-clip-text">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin}>
          <CustomInput
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <CustomInput
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center mb-6">
            <Link to="/forgot-password" className="text-sm text-orange-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && <p className="text-red-500 font-semibold mb-2">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="w-6 h-6 animate-spin  mx-auto" /> : "Login"}
          </motion.button>
        </form>
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
