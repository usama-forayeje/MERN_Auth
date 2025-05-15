import { motion } from "framer-motion"
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa"

const SocialLoginButtons = () => {
  const handleSocialLogin = (provider) => {
    // Redirect to backend auth endpoint
    const apiUrl = import.meta.env.MODE === "development" ? "http://localhost:8000/api/v1/auth" : "/api/v1/auth"

    window.location.href = `${apiUrl}/social-login/${provider}`
  }

  return (
    <div className="space-y-3 mt-4">
      <p className="text-center text-gray-400 text-sm">Or continue with</p>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSocialLogin("google")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <FaGoogle className="text-red-500" />
          <span>Google</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSocialLogin("facebook")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] text-white rounded-lg font-medium hover:bg-[#166FE5] transition-colors"
        >
          <FaFacebook />
          <span>Facebook</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSocialLogin("github")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
        >
          <FaGithub />
          <span>GitHub</span>
        </motion.button>
      </div>
    </div>
  )
}

export default SocialLoginButtons
