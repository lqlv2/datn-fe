<template>
  <a-layout-header class="header">
    <div class="header-content">
      <!-- Logo on the left -->
      <img src="@/assets/login-logo.jpg" alt="Logo" class="logo" />
      <span class="title">Internship Management System </span>

      <div v-if="isLogin" div class="user-info">
        <span class="username">{{ usernameDetail }}</span>

        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1">
                <a @click.prevent="changePassword">Change Password</a>
              </a-menu-item>
              <a-menu-item key="2">
                <a @click.prevent="logout">Logout</a>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button type="link">
            <a-avatar style="background-color: #87d068">
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
            <down-outlined />
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
  padding: 0 16px;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
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
  font-size: 1.2em;
  color: #f0f0f0;
}

.user-info {
  display: inline;
}

.username {
  margin-right: 16px;
  font-size: 16px;
  color: #f0f0f0;
}
</style>
