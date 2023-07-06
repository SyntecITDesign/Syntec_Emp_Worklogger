<script setup>
import { storeToRefs } from "pinia";
import { RouterView } from "vue-router";
import LogInVue from "../components/LogIn.vue";
import {
  NSpace,
  NLayout,
  NLayoutSider,
  NMenu,
  NButton,
  NDivider,
  NAvatar,
  NH4,
  NSwitch,
  NIcon,
  NImage,
  NScrollbar,
} from "naive-ui";
import { ExitOutline as ExitIcon } from "@vicons/ionicons5";
import { onBeforeMount } from "vue";
import { useSiderStore } from "../stores/siderStore.js";
import { useLogInStore } from "../stores/logInStore.js";
const siderStore = useSiderStore();
const { collapsed, menuOptions, wholeTheme } = storeToRefs(siderStore);
const { renderIcon, expandIcon } = siderStore;
const logInStore = useLogInStore();
const { access, welcomeText } = storeToRefs(logInStore);
const logOut = () => {
  access.value.basicAuth = null;
  access.value.isLogIn = false;
  localStorage.clear();
};
</script>

<template>
  <n-space vertical>
    <n-layout has-sider>
      <n-layout-sider
        bordered
        :native-scrollbar="false"
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
        style="height: calc(100vh - 0rem)"
        v-if="access.isLogIn"
      >
        <img
          v-if="wholeTheme && !collapsed"
          src="../assets/SyntecLogo.png"
          class="logo"
        /><img
          v-if="!wholeTheme && !collapsed"
          src="../assets/SyntecLogoDark.png"
          class="logo"
        />
        <img v-if="collapsed" src="../assets/SyntecIcon.png" class="icon" />
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :expand-icon="expandIcon"
        />
      </n-layout-sider>
      <n-layout class="NLayout">
        <LogInVue v-if="!access.isLogIn" />
        <RouterView v-else />
        <n-switch
          v-model:value="wholeTheme"
          style="position: absolute; bottom: 1rem; right: 1rem"
        >
          <template #checked>淺色主題</template>
          <template #unchecked>深色主題</template>
        </n-switch>
        <n-space
          v-if="access.isLogIn"
          style="
            position: absolute;
            top: 1rem;
            right: 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
          "
          >{{ welcomeText }}
          <n-button class="NButton" @click="logOut"
            ><template #icon>
              <n-icon><exit-icon /></n-icon>
            </template>
            登出</n-button
          >
        </n-space>
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style scoped>
.NLayout {
  padding: 3% 3% 3% 3%;
  height: calc(100vmin);
}
.logo {
  width: 95%;
  margin-top: 5%;
  margin-left: 5%;
}
.icon {
  width: 60%;
  margin-top: 5%;
  margin-left: 20%;
}
</style>
