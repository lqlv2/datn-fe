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
  UserOutlined,
  FundOutlined,
  ProfileOutlined,
  TeamOutlined,
  CrownOutlined,
  SettingOutlined,
  ReadOutlined,
} from "@ant-design/icons-vue";
import {ref, computed, onMounted, watch} from "vue";
import { useAuthStore } from "@/stores/authStore";
import {useRoute} from "vue-router";

const collapsed = ref(false);
const selectedKeys = ref(["6"]);
const route = useRoute();
const authStore = useAuthStore();

const menuItems = [
  { key: "1", label: "Account", route: "/account", icon: SettingOutlined, roles: ["ADMIN"] },
  { key: "4", label: "Admin", route: "/admin", icon: CrownOutlined, roles: ["MENTOR", 'INTERN']},
  { key: "2", label: "Intern", route: "/intern", icon: UserOutlined, roles: ["ADMIN", "MENTOR"]},
  { key: "3", label: "Mentor", route: "/mentor", icon: TeamOutlined, roles: ["ADMIN", 'INTERN']},
  { key: "5", label: "Classes", route: "/classes", icon: ReadOutlined, roles: ["ADMIN"] },
  { key: "6", label: "Task", route: "/task", icon: ProfileOutlined, roles: ["ADMIN", "MENTOR", "INTERN"] },
  { key: "7", label: "Evaluation", route: "/evaluation", icon: FundOutlined, roles: ["ADMIN", "INTERN", "MENTOR"] }
];

const filteredMenuItems = computed(() => {
  return menuItems.filter((item) => item.roles.includes(authStore.userRole)).map(item => ({...item, route: `/${authStore.userRole.toLowerCase()}${item.route}`}))
});


const getMenuKeyFromRoute = (path) => {
  const currentPath = path.split('/').filter(Boolean);
  if (currentPath.length > 1) {
    const menuPath = currentPath[1]; // Get the second segment (after role)
    const matchingItem = menuItems.find(item => item.route === `/${menuPath}`);
    return matchingItem ? matchingItem.key : null;
  }
  return null;
};

const updateSelectedKeys = () => {
  const key = getMenuKeyFromRoute(route.path);
  if (key) {
    selectedKeys.value = [key];
  }
};

// Initialize on component mount
onMounted(() => {
  updateSelectedKeys();
});

// Watch for route changes
watch(
    () => route.path,
    () => updateSelectedKeys()
);


</script>

<style scoped>
.site-layout .site-layout-background {
  background: #fff;
}
[data-theme="dark"] .site-layout .site-layout-background {
  background: #141414;
}
</style>
