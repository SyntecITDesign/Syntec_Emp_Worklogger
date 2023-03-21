<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-page-header>
      <template #avatar>
        <n-avatar src="https://www.syntecclub.com/images/common/Icon@2.png" />
      </template>
      <template #extra>
        <n-space>
          <n-button class="NButton">登出</n-button>
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

import { defineComponent } from "vue";

const themeOverrides = {
  Avatar: {
    heightMedium: "64px",
  },
};
const handleBack = () => {
  console.log("[onBack]");
};
const options = [
  {
    label: "催更",
    key: "1",
  },
  {
    label: "催更",
    key: "2",
  },
  {
    label: "催更",
    key: "3",
  },
];
</script>

<style scoped>
.NButton {
  margin-right: 20px;
}
</style>
