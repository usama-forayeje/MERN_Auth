import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import {
  Home,
  User,
  Lock,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  ChevronDown,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import NameInitialsAvatar from "./NameInitialsAvatar";

const AppLayout = ({ children }) => {
  const { signout, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signout();
      navigate("/sign-in");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/change-password", icon: Lock, label: "Change Password" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const avatarUrl = user?.avatar?.url;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Navigation Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 text-transparent bg-clip-text">
              Auth App
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            <div className="user-dropdown relative">
              <button
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-white/10 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl || "/placeholder.svg"}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
                  />
                ) : (
                  <NameInitialsAvatar
                    name={user?.name || "User"}
                    size="w-8 h-8"
                    textSize="text-sm"
                  />
                )}
                <span className="hidden sm:block text-white/90 font-medium">
                  {user?.name?.split(" ")[0]}
                </span>
                <ChevronDown size={16} className="text-white/70" />
              </button>

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="text-white font-medium">{user?.name}</p>
                    <p className="text-white/70 text-sm truncate">{user?.email}</p>
                  </div>
                  <ul>
                    <li>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/change-password"
                        className="flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <Lock size={16} />
                        <span>Change Password</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Sidebar */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="fixed inset-0 z-40 md:hidden"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="absolute top-0 left-0 w-64 h-full bg-black/80 backdrop-blur-md border-r border-white/10 p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 text-transparent bg-clip-text">
                Menu
              </h2>
              <button className="text-white/80" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-white border-l-4 border-orange-500"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:block w-64 bg-black/20 backdrop-blur-md border-r border-white/10 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-auto"
        >
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-white border-l-4 border-orange-500"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-xs uppercase text-white/50 font-semibold mb-3 px-4">Analytics</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="#"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white/70 hover:bg-white/10"
                  >
                    <BarChart3 size={20} />
                    <span>Statistics</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white/70 hover:bg-white/10"
                  >
                    <Calendar size={20} />
                    <span>Activity</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white/70 hover:bg-white/10"
                  >
                    <Settings size={20} />
                    <span>Settings</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </motion.aside>

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;
