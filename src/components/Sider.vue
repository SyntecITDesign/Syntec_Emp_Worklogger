<script setup>
import { storeToRefs } from "pinia";
import { RouterView } from "vue-router";
import LogInVue from "../components/LogIn.vue";
import { NSpace, NLayout, NLayoutSider, NMenu } from "naive-ui";
import { onBeforeMount } from "vue";
import { useSiderStore } from "../stores/siderStore.js";
const siderStore = useSiderStore();
const { collapsed, isLogIn } = storeToRefs(siderStore);
const { menuOptions, renderIcon, expandIcon } = siderStore;
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
        style="height: calc(100vh - 4.125rem)"
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
        <LogInVue v-if="!isLogIn" />
        <RouterView v-else />
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style scoped>
.NLayout {
  padding: 0% 5% 5% 5%;
}
</style>
