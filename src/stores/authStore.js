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

      usernameDetail.value = decodedToken.iss;
      userRole.value = decodedToken.role;
      localStorage.setItem('userRole', decodedToken.role);
      localStorage.setItem('usernameDetail', decodedToken.iss);
      localStorage.setItem('username', decodedToken.sub);

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
    localStorage.removeItem('usernameDetail')

    delete axiosInstance.defaults.headers.common['Authorization'];

    userRole.value = null;
    usernameDetail.value = null;

    router.push(PAGES.LOGIN);
  }


  return {
    isAuthenticated,
    usernameDetail,
    userRole,
    loginUser,
    logout,
    resetPass,
    forgotPass,
  };
});
