<template>
  <a-layout style="min-height: 100vh">
    <Header />
    <a-layout>
      <SideNav v-if="isAuthenticated" />
      <a-layout-content style="flex: 1">
        <router-view />
      </a-layout-content>
    </a-layout>
    <Footer />
  </a-layout>
</template>

<script setup>
import SideNav from "./components/SideNav.vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import { computed } from "vue";
import { useAuthStore } from "./stores/authStore";

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}
</style>
