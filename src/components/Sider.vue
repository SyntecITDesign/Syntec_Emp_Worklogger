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
} from "naive-ui";
import { onBeforeMount } from "vue";
import { useSiderStore } from "../stores/siderStore.js";
import { useLogInStore } from "../stores/logInStore.js";
const siderStore = useSiderStore();
const { collapsed, menuOptions, wholeTheme } = storeToRefs(siderStore);
const { renderIcon, expandIcon } = siderStore;
const logInStore = useLogInStore();
const { access, welcomeText } = storeToRefs(logInStore);
</script>

<template>
  <n-space vertical>
    <n-layout has-sider>
      <n-layout-sider
        bordered
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
          style="position: absolute; bottom: 2rem; right: 2rem"
        >
          <template #checked>淺色主題</template>
          <template #unchecked>深色主題</template>
        </n-switch>
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style scoped>
.NLayout {
  padding: 3% 3% 3% 3%;
  height: calc(100vh - 0rem);
}
</style>
