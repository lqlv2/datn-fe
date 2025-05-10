<template>
  <!-- Sidebar -->
  <a-layout-sider v-model:collapsed="collapsed" collapsible>
    <div class="logo" />
    <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
      <a-menu-item
        v-for="item in filteredMenuItems"
        :key="item.key"
      >
        <component :is="item.icon" />
        <span>
          <router-link :to="item.route">{{ item.label }}</router-link>
        </span>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import {
  FolderOutlined,
  UserOutlined,
  FundOutlined,
  ProfileOutlined,
  TeamOutlined,
  DesktopOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/authStore"; 

const collapsed = ref(false);
const selectedKeys = ref(["1"]);

const authStore = useAuthStore();

const menuItems = [
  { key: "1", label: "Account", route: "/account", icon: SettingOutlined, roles: ["ADMIN"] },
  { key: "2", label: "Intern", route: "/intern", icon: UserOutlined, roles: ["ADMIN", "MENTOR"]},
  { key: "3", label: "Mentor", route: "/mentor", icon: TeamOutlined, roles: ["ADMIN", 'INTERN']},
  { key: "6", label: "Task", route: "/task", icon: ProfileOutlined, roles: ["ADMIN", "MENTOR", "INTERN"] },
  { key: "7", label: "Evaluation", route: "/evaluation", icon: FundOutlined, roles: ["ADMIN", "INTERN", "MENTOR"] }
];

// Filter menu items based on user role
const filteredMenuItems = computed(() => {
  return menuItems.filter((item) => item.roles.includes(authStore.userRole)).map(item => ({...item, route: `/${authStore.userRole.toLowerCase()}${item.route}`}))
});
</script>

<style scoped>
.site-layout .site-layout-background {
  background: #fff;
}
[data-theme="dark"] .site-layout .site-layout-background {
  background: #141414;
}
</style>
