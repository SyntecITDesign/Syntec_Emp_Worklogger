<template>
  <n-config-provider
    :theme-overrides="themeOverrides"
    @mousemove="checkLogInTime"
  >
    <HeaderVue />
    <SiderVue />
  </n-config-provider>
</template>

<script setup>
import SiderVue from "./components/Sider.vue";
import HeaderVue from "./components/Header.vue";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { NConfigProvider } from "naive-ui";
import { useSiderStore } from "./stores/siderStore.js";
import { useLogInStore } from "./stores/logInStore.js";

const logInStore = useLogInStore();
const { checkLogInTime } = logInStore;
const siderStore = useSiderStore();
const themeOverrides = {
  Menu: {
    itemColorActive: "#01006b26",
    itemColorActiveHover: "#01006b26",
    itemColorActiveCollapsed: "#01006b26",
    itemTextColorActive: "#01006bFF",
    itemTextColorActiveHover: "#01006bFF",
    itemTextColorChildActive: "#01006bFF",
    itemTextColorChildActiveHover: "#01006bFF",
    itemTextColorHoverHorizontal: "#01006bFF",
    itemTextColorActiveHorizontal: "#01006bFF",
    itemTextColorActiveHoverHorizontal: "#01006bFF",
    itemTextColorChildActiveHorizontal: "#01006bFF",
    itemTextColorChildActiveHoverHorizontal: "#01006bFF",
    itemIconColorActive: "#01006bFF",
    itemIconColorActiveHover: "#01006bFF",
    itemIconColorChildActive: "#01006bFF",
    itemIconColorChildActiveHover: "#01006bFF",
    itemIconColorHoverHorizontal: "#01006bFF",
    itemIconColorActiveHorizontal: "#01006bFF",
    itemIconColorActiveHoverHorizontal: "#01006bFF",
    itemIconColorChildActiveHorizontal: "#01006bFF",
    itemIconColorChildActiveHoverHorizontal: "#01006bFF",
    arrowColorActive: "#01006bFF",
    arrowColorActiveHover: "#01006bFF",
    arrowColorChildActive: "#01006bFF",
    arrowColorChildActiveHover: "#01006bFF",
    itemColorActiveInverted: "#01006bFF",
    itemColorActiveHoverInverted: "#01006bFF",
    itemColorActiveCollapsedInverted: "#01006bFF",
  },
};

onBeforeMount(() => {
  checkLogInTime();
});
</script>

<style scoped></style>
