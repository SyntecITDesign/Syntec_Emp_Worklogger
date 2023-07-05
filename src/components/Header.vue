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
import { ref, onMounted, onUnmounted } from "vue";
import { useSiderStore } from "../stores/siderStore.js";
import { useLogInStore } from "../stores/logInStore.js";
const siderStore = useSiderStore();
const { collapsed } = storeToRefs(siderStore);
const logInStore = useLogInStore();
const { access, welcomeText } = storeToRefs(logInStore);
const themeOverrides = {
  Avatar: {
    heightMedium: "4rem",
  },
};
const logOut = () => {
  access.value.basicAuth = null;
  access.value.isLogIn = false;
  localStorage.clear();
};
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-page-header>
      <template #avatar>
        <div class="headerTitle">
          <n-avatar src="https://www.syntecclub.com/images/common/Icon@2.png" />
          <transition name="headerTitle"
            ><div v-if="!collapsed">Worklogger</div></transition
          >
        </div>
      </template>
    </n-page-header>
  </n-config-provider>
</template>

<style scoped>
.NButton {
  margin-right: 1.25rem;
}
.headerTitle {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.75rem;
  font-weight: 900;
  color: #01006b;
}

.headerTitle-enter-active,
.headerTitle-leave-active {
  transition: all 0.3s ease-in-out;
}

.headerTitle-enter-from,
.headerTitle-leave-to {
  transform: translateX(0px);
  opacity: 0;
}
</style>
