import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8000/api/v1/auth" : "/api/v1/auth";

axios.defaults.withCredentials = true;

const initialState = {
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,
};

export const useAuthStore = create((set) => ({
  ...initialState,

  resetState: () =>
    set({
      error: null,
      message: null,
    }),

  signup: async (email, password, name) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(
        `${API_URL}/sign-up`,
        { email, password, name },
        { withCredentials: true }
      );
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        message: response.data.message || "Account created successfully!",
      });
      return response.data;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  signin: async (email, password) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(
        `${API_URL}/sign-in`,
        { email, password },
        { withCredentials: true }
      );
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
        isLoading: false,
        message: response.data.message || "Logged in successfully!",
      });
      return response.data;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message || "Error logging in",
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(`${API_URL}/verify`, { code }, { withCredentials: true });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        message: response.data.message || "Email verified successfully!",
      });
      return response.data;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },

  signout: async () => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(`${API_URL}/sign-out`, {}, { withCredentials: true });
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
        message: response.data.message || "Logged out successfully!",
      });
      return response.data;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message || "Error logging out",
        isLoading: false,
      });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(
        `${API_URL}/forgot-password`,
        { email },
        { withCredentials: true }
      );
      set({
        message: response.data.message || "Reset link sent to your email!",
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error?.response?.data?.message || error.message || "Error sending reset password email",
      });
      throw error;
    }
  },

  resetPassword: async (forgotPasswordToken, password) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(
        `${API_URL}/reset-password/${forgotPasswordToken}`,
        { password },
        { withCredentials: true }
      );
      set({
        message: response.data.message || "Password reset successfully!",
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || error.message || "Error resetting password",
      });
      throw error;
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(
        `${API_URL}/change-password`,
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      set({
        message: response.data.message || "Password changed successfully!",
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || error.message || "Error changing password",
      });
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.patch(`${API_URL}/profile-update`, profileData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set({
        user: response.data.user,
        message: response.data.message || "Profile updated successfully!",
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || error.message || "Error updating profile",
      });
      throw error;
    }
  },

  googleLoginCallback: async (provider, token) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(
        `${API_URL}/auth/google-login`,
        { idToken: token },
        { withCredentials: true }
      );

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        message: response.data.message || `Logged in with ${provider} successfully!`,
      });

      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error?.response?.data?.message || error.message || `Error logging in with ${provider}`,
      });
      throw error;
    }
  },

  profile: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        withCredentials: true,
      });
      const user = response.data?.data;
      if (user) {
        set({
          user,
          isAuthenticated: true,
          isCheckingAuth: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isCheckingAuth: false,
        });
      }
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message || "Could not fetch profile",
        isCheckingAuth: false,
        isAuthenticated: false,
        user: null,
      });
    }
  },
}));
