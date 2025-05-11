<template>
  <a-layout-header class="header">
    <div class="header-content" style="padding: 16px">
      <!-- Logo on the left -->
      <img src="@/assets/login-logo.jpg" alt="Logo" class="logo" />
      <span class="title">Internship Management System</span>

      <div v-if="isLogin" div class="user-info">
        <span class="username">{{ usernameDetail }}</span>

        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1">
                <a @click.prevent="changePassword">Change Password</a>
              </a-menu-item>
              <a-menu-item key="2" class="logout-item">
                <a @click.prevent="logout">Logout</a>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button type="link">
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup>
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from 'vue-router';
import { UserOutlined } from "@ant-design/icons-vue";
import { computed } from "vue";
import PAGES from "@/constants/pages";
import { DownOutlined } from "@ant-design/icons-vue";

const authStore = useAuthStore();
const router = useRouter();
const isLogin = computed(() => authStore.isAuthenticated)
const usernameDetail = computed(() => authStore.usernameDetail);

const changePassword = () => {
  router.push(PAGES.CHANGE_PASSWORD);
};

const logout = () => {
  authStore.logout();
}
</script>

<style scoped>
.header {
  background: #f0f0f0;
  background-color: rgb(29, 31, 59);
  display: flex;
  align-items: center;
  padding: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 24px;
}

.logo {
  height: 50px;
  margin-left: -10px;
  border-radius: 4px;
}

.title {
  font-weight: bold;
  margin-left: 17px;
  flex-grow: 1; /* Pushes user-info to the right */
  font-size: 1.5em;
  color: #f0f0f0;
  letter-spacing: 0.5px;
}

.user-info {
  display: inline;
}

.username {
  margin-right: 16px;
  font-size: 16px;
  color: #f0f0f0;
}

a-menu-item:hover {
  background-color: #e6e6e6;
}

.logout-item a {
  color: red;
}
</style>
