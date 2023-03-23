<template>
  <HeaderVue />
  <SiderVue />
</template>

<script setup>
import SiderVue from "./components/Sider.vue";
import HeaderVue from "./components/Header.vue";
import { useCookies } from "vue3-cookies";
import { onMounted } from "vue";
const Cookies = useCookies();
const { cookies } = Cookies;



</script>

<style scoped></style>
