<script setup>
import { storeToRefs } from "pinia";
import { RouterView } from "vue-router";
import LogInVue from "./LogIn.vue";
import {
  NSpace,
  NLayout,
  NButton,
  NSwitch,
  NIcon,
} from "naive-ui";
import { ExitOutline as ExitIcon } from "@vicons/ionicons5";
import { useLogInStore } from "../stores/logInStore.js";

const logInStore = useLogInStore();
const { access, welcomeText } = storeToRefs(logInStore);
const logOut = () => {
  access.value.basicAuth = null;
  access.value.isLogIn = false;
  localStorage.clear();
};
</script>

<template>
  <n-layout class="NLayout">
    <LogInVue v-if="!access.isLogIn" />
    <RouterView v-else />
    <n-switch v-model:value="wholeTheme"
      style="position: absolute; bottom: 1rem; right: 1rem">
      <template #checked>淺色主題</template>
      <template #unchecked>深色主題</template>
    </n-switch>
    <n-space v-if="access.isLogIn"
      style="
            position: absolute;
            top: 1rem;
            right: 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
          ">{{ welcomeText }}
      <n-button class="NButton"
        @click="logOut"><template #icon>
          <n-icon><exit-icon /></n-icon>
        </template> 登出</n-button>
    </n-space>
  </n-layout>
</template>

<style scoped>
.NLayout {
  padding: 3% 3% 3% 3%;
  height: calc(100vmin);
}
</style>
