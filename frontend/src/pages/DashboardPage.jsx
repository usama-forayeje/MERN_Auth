import { motion } from "framer-motion"
import { useAuthStore } from "../store/authStore"
import { formatDate } from "../utils/date"
import { Link } from "react-router"
import { Award, Calendar, Clock, Globe, LogIn, Mail, Monitor, Server, Shield, Smartphone, User } from "lucide-react"
import StatsCard from "../components/StatsCard"
import ActivityCard from "../components/ActivityCard"
import NameInitialsAvatar from "../components/NameInitialsAvatar"

const DashboardPage = () => {
  const { user } = useAuthStore()

  const avatarUrl = user?.avatar?.url

  // Create mock activities based on user data
  const activities = [
    {
      icon: LogIn,
      title: "Login",
      description: `Logged in from ${user?.lastLoginMeta?.browser || "Unknown browser"} on ${user?.lastLoginMeta?.os || "Unknown OS"}`,
      timestamp: user?.lastLoginAt || new Date(),
      color: "amber",
    },
    {
      icon: Shield,
      title: "Security",
      description: "Email verification completed",
      timestamp: user?.createdAt ? new Date(new Date(user.createdAt).getTime() + 3600000) : new Date(),
      color: "green",
    },
    {
      icon: User,
      title: "Profile",
      description: "Account created successfully",
      timestamp: user?.createdAt || new Date(),
      color: "blue",
    },
  ]

  return (
    <div className="container mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}</h1>
          <p className="text-white/70">Here's what's happening with your account today.</p>
        </div>

        <div className="flex items-center gap-3 p-2 bg-black/20 backdrop-blur-md rounded-lg border border-white/10">
          {avatarUrl ? (
            <img
              src={avatarUrl || "/placeholder.svg"}
              alt={user?.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
            />
          ) : (
            <NameInitialsAvatar name={user?.name || "User"} size="w-12 h-12" textSize="text-lg" />
          )}

          <div>
            <h3 className="text-white font-medium">{user?.name}</h3>
            <p className="text-white/70 text-sm">{user?.role || "User"}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Calendar}
          title="Member Since"
          value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
          color="amber"
          delay={0.1}
        />
        <StatsCard
          icon={Clock}
          title="Last Login"
          value={formatDate(user?.lastLoginAt, true)}
          color="orange"
          delay={0.2}
        />
        <StatsCard icon={Shield} title="Account Status" value={user?.status || "Active"} color="rose" delay={0.3} />
        <StatsCard icon={Award} title="Login Attempts" value={user?.loginAttempts || "0"} color="purple" delay={0.4} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-black/30 backdrop-blur-md rounded-xl border border-orange-500/30 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <User className="text-amber-500" size={20} />
              </div>
              <div>
                <p className="text-white/60 text-sm">Full Name</p>
                <p className="text-white font-medium">{user?.name || "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Mail className="text-orange-500" size={20} />
              </div>
              <div>
                <p className="text-white/60 text-sm">Email</p>
                <p className="text-white font-medium">{user?.email || "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                <Shield className="text-rose-500" size={20} />
              </div>
              <div>
                <p className="text-white/60 text-sm">Role</p>
                <p className="text-white font-medium">{user?.role || "User"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Award className="text-purple-500" size={20} />
              </div>
              <div>
                <p className="text-white/60 text-sm">Status</p>
                <p className="text-white font-medium">{user?.status || "Active"}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mt-6 mb-4">Device Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Globe className="text-blue-500" size={20} />
              </div>
              <div>
                <p className="text-white/60 text-sm">IP Address</p>
                <p className="text-white font-medium">{user?.lastLoginMeta?.ip || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Monitor className="text-green-500" size={20} />
              </div>
              <div>
                <p className="text-white/60 text-sm">Browser</p>
                <p className="text-white font-medium">{user?.lastLoginMeta?.browser || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Server className="text-teal-500" size={20} />
              </div>
              <div>
                <p className="text-white/60 text-sm">Operating System</p>
                <p className="text-white font-medium">{user?.lastLoginMeta?.os || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Smartphone className="text-cyan-500" size={20} />
              </div>
              <div>
                <p className="text-white/60 text-sm">Device</p>
                <p className="text-white font-medium">{user?.lastLoginMeta?.device || "Unknown"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              to="/profile"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white 
              font-bold rounded-lg shadow-lg text-center hover:from-amber-600 hover:to-orange-700
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Edit Profile
            </Link>
            <Link
              to="/change-password"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-600 to-rose-500 text-white 
              font-bold rounded-lg shadow-lg text-center hover:from-orange-700 hover:to-rose-600
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Change Password
            </Link>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <ActivityCard activities={activities} />
      </div>
    </div>
  )
}

export default DashboardPage
