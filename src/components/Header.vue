<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-page-header>
      <template #avatar>
        <n-avatar src="https://www.syntecclub.com/images/common/Icon@2.png" />
      </template>
      <template #extra>
        <n-space v-if="isLogIn">
          <div>Hi, {{ empID }}</div>

          <n-button class="NButton" @click="logOut">登出</n-button>
        </n-space>
      </template>
    </n-page-header>
  </n-config-provider>
</template>

<script setup>
import {
  NPageHeader,
  NGrid,
  NGi,
  NStatistic,
  NBreadcrumb,
  NBreadcrumbItem,
  NAvatar,
  NSpace,
  NButton,
  NDropdown,
  NConfigProvider,
} from "naive-ui";

import { storeToRefs } from "pinia";
import { useSiderStore } from "../stores/siderStore.js";
const siderStore = useSiderStore();
const { isLogIn, empID } = storeToRefs(siderStore);
const themeOverrides = {
  Avatar: {
    heightMedium: "4rem",
  },
};
const logOut = () => {
  isLogIn.value = false;
  localStorage.clear();
};
</script>

<style scoped>
.NButton {
  margin-right: 1.25rem;
}
</style>
