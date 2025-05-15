import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axiosInstance from '@/plugins/axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'vue-router';
import PAGES from '@/constants/pages';
import { login, forgotPassword, resetPassword } from '@/services/authService';
import {getCurrentUserRole} from "@/util/Functions.js";

export const useAuthStore = defineStore('auth', () => {
  const usernameDetail = ref(localStorage.getItem('usernameDetail') || null);
  const userRole = ref(localStorage.getItem('userRole') || null);
  const router = useRouter();
  const isAuthenticated = computed(() => !!userRole.value);
  const successMessage = ref('');
  const errorMessage = ref('');
  
  // Add currentUser property with user ID to match what components are using
  const currentUser = computed(() => {
    // Get the user ID from localStorage or use a default value for development
    const userId = localStorage.getItem('userId') || '1'; // Default to user ID 1 for testing
    if (userId) {
      return { id: parseInt(userId, 10) };
    }
    return null;
  });

  const ROLE_TO_PAGE = {
    ADMIN: '/account',
    INTERN: '/project',
    MENTOR: '/intern',
    EDU: '/intern',
    DL: '/intern',
    REC: '/intern',
    COO: '/recruit-edu',
  };

  async function loginUser(username, password) {
    try {
      const response = await login(username, password);
      const accessToken = response.data.data.accessToken;

      localStorage.setItem('access_token', accessToken);

      axiosInstance.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken);
      console.log('Decoded token:', decodedToken);

      usernameDetail.value = decodedToken.iss;
      userRole.value = decodedToken.role;
      localStorage.setItem('userRole', decodedToken.role);
      localStorage.setItem('usernameDetail', decodedToken.iss);
      localStorage.setItem('username', decodedToken.sub);
      
      // Try to find user ID in the token (common fields where it might be located)
      const possibleUserIdFields = ['internId', 'userId', 'sub', 'id', 'user_id', 'uid'];
      let userId = null;
      
      for (const field of possibleUserIdFields) {
        if (decodedToken[field]) {
          userId = decodedToken[field];
          break;
        }
      }
      
      // If we didn't find a specific userId field, try to parse it from other token fields
      if (!userId && decodedToken.sub) {
        // Sometimes the subject contains or is the user ID
        const subParts = decodedToken.sub.split(':');
        if (subParts.length > 1 && !isNaN(subParts[subParts.length - 1])) {
          userId = subParts[subParts.length - 1];
        } else if (!isNaN(decodedToken.sub)) {
          userId = decodedToken.sub;
        }
      }
      
      if (userId) {
        console.log('Found user ID:', userId);
        localStorage.setItem('userId', userId);
      }

      const targetPage = `/${getCurrentUserRole().toLowerCase()}/task`;
      await router.push(targetPage);

    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async function forgotPass(email) {
    try {
      const response = await forgotPassword(email);
      successMessage.value = response.data;
    } catch (error) {
      errorMessage.value = error.response.data || 'An error occurred while sending the reset link';
    }
  }

  async function resetPass(token, newPassword) {
    try {
      const response = await resetPassword(token, newPassword);
      successMessage.value = response.data;
    } catch (error) {
      errorMessage.value = error.response.data || 'An error occurred while resetting the password';
    }
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('usernameDetail');
    localStorage.removeItem('userId');

    delete axiosInstance.defaults.headers.common['Authorization'];

    userRole.value = null;
    usernameDetail.value = null;

    router.push(PAGES.LOGIN);
  }


  return {
    isAuthenticated,
    usernameDetail,
    userRole,
    currentUser,
    loginUser,
    logout,
    resetPass,
    forgotPass,
  };
});
