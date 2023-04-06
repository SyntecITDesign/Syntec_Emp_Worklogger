<template>
  <HeaderVue />
  <SiderVue />
</template>

<script setup>
import SiderVue from "./components/Sider.vue";
import HeaderVue from "./components/Header.vue";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { useSiderStore } from "./stores/siderStore.js";
const siderStore = useSiderStore();
const { isLogIn } = storeToRefs(siderStore);

onBeforeMount(() => {
  localStorage.getItem("token") === null ||
  new Date().getTime() - localStorage.getItem("loginTime") > 600000 * 5
    ? (isLogIn.value = false)
    : (isLogIn.value = true);
});
</script>

<style scoped></style>
