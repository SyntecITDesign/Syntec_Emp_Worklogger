<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-page-header>
      <template #avatar>
        <n-avatar src="https://www.syntecclub.com/images/common/Icon@2.png" />
      </template>
      <template #extra>
        <n-space>
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
import { defineComponent } from "vue";
import { useSiderStore } from "../stores/siderStore.js";
const siderStore = useSiderStore();
const { isLogIn } = storeToRefs(siderStore);
const themeOverrides = {
  Avatar: {
    heightMedium: "64px",
  },
};
const logOut = () => {
  isLogIn.value = false;
};
</script>

<style scoped>
.NButton {
  margin-right: 20px;
}
</style>
