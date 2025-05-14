import axios from "axios";
import { create } from "zustand";

const API_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8000/api//v1/user" : "/api/v1/user";

axios.defaults.withCredentials = true;

export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  profile: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/profile`);
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
      console.log(error);
    }
  },
}));
