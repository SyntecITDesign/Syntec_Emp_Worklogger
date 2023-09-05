<script setup>
import SiderVue from "./components/Sider.vue";
import MainVue from "./components/Main.vue";
import { onBeforeMount } from "vue";
import { NConfigProvider, darkTheme, NLayout, NSpace } from "naive-ui";
import { storeToRefs } from "pinia";
import { useLogInStore } from "./stores/logInStore.js";
import { useSiderStore } from "./stores/siderStore.js";

const logInStore = useLogInStore();
const siderStore = useSiderStore();
const { checkLogInTime } = logInStore;
const { wholeTheme } = storeToRefs(siderStore);

onBeforeMount(() => {
  checkLogInTime();
});
</script>

<template>
  <n-config-provider :theme="wholeTheme ? null : darkTheme"
    @mousemove="checkLogInTime">
    <n-space vertical>
      <n-layout has-sider>
        <SiderVue />
        <MainVue />
      </n-layout>
    </n-space>
  </n-config-provider>
</template>

<style scoped></style>
