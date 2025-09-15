import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

// Set axios to send cookies with requests.
axios.defaults.withCredentials = true;

// Base URL for API requests.

export const useAuthStore = create((set) => ({
  user: null,
  error: null,
  isLoading: false,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isCheckingAuth: true,
  setError: () => set({ error: null }),
  /**
   * méthode signup pour l'inscription des utilisateurs username, email, and password.
   */
signup: async (credentials) => {
  set({ user: null, isSigningUp: true, error: null });
  try {
    const res = await axios.post('/api/auth/register', credentials);
    set({
      user: res.data.user,
      token: res.data.token,
      isSigningUp: false,
    });
    return res.data;
  } catch (error) {
    set({
      isSigningUp: false,
      error: error.response?.data?.message || 'Erreur inscription',
    });
    throw error;
  }
},

login: async (credentials) => {
  set({ isLoggingIn: true, error: null });
  try {
    const res = await axios.post('/api/auth/login', credentials);
    set({
      user: res.data.user,
      token: res.data.token,
      isLoggingIn: false,
    });
    return res.data;
  } catch (error) {
    set({
      isLoggingIn: false,
      error: error.response?.data?.message || 'Login failed',
    });
    throw error;
  }
},


  /**
   * Logs out the current user.
   *
   * This function sends a request to the server to log out the user.
   * It clears the user data from the store and sets the authentication status to false.
   */
  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axios.post('/api/auth/logout');
      set({ user: null, isLoggingOut: false });
      toast.success('Logged out successfully');
    } catch (error) {
      set({ isLoggingOut: false });
      toast.error(error.response.data.message || 'Failed to logout');
    }
  },

  /**
   * Checks the user's authentication status by making a request to the server.
   *
   * If the user is authenticated, it updates the store with the user's data and sets the authentication status to true.
   * If the user is not authenticated, it clears the user data from the store and sets the authentication status to false.
   */
  checkAuth: async () => {
    set({ user: null, isCheckingAuth: true });
    try {
      const res = await axios.get('/api/v1/account/auth');
      set({ user: res.data.user, isCheckingAuth: false });
    } catch (error) {
      set({ isCheckingAuth: false });
    }
  },

  /**
   * Verifies the user's email using the provided verification code.
   * code - The verification code sent to the user's email.
   */
  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post('/api/v1/account/verify/email', { code });
      set({ user: res.data.user, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.response.data.message || 'Error verifying email', isLoading: false });
      throw error;
    }
  },

  /**
   * Sends a password reset email to the provided email address.
   *
   * This function makes a POST request to the server's forgot password endpoint.
   * If the email address is valid, the server sends a password reset email to the user.
   */
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post('/api/v1/account/forgot/password', { email });
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.response.data.message || 'Error in sending password reset email', isLoading: false });
      throw error;
    }
  },

  /**
   * Resets the user's password using the provided reset token and new password.
   *
   * This function makes a POST request to the server's reset password endpoint.
   * If the reset token is valid and the new password is provided, the server resets the user's password.
   */
  resetPassword: async (resetToken, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/api/v1/account/reset/password/${resetToken}`, { password: newPassword });
      set({ isLoading: false, error: null });
    } catch (error) {
      set({ error: error.response.data.message || 'Error resetting password', isLoading: false });
      throw error;
    }
  },
}));
