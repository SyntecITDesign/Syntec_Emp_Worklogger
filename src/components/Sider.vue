<script setup>
import { h, ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { NIcon, NSpace, NLayout, NLayoutSider, NMenu, } from "naive-ui";
import {
  Add as addIcon,
  Analytics as analyticsIcon,
  HomeOutline as homeIcon,
  CaretDownOutline as caretDownOutline,
} from "@vicons/ionicons5";

const collapsed = ref(true);

const menuOptions = [
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "home",
          params: {
            lang: "zh-CN"
          }
        }
      },
      { default: () => "首頁" }
    ),
    key: "go-back-home",
    icon: renderIcon(homeIcon)
  },
  {
    label: () => h(
      RouterLink,
      {
        to: {
          name: "addWorklogForm",
          params: {
            lang: "zh-CN"
          }
        }
      },
      { default: () => "新增工作日誌" }
    ),
    key: "go-AddWorkForm",
    icon: renderIcon(addIcon)
  },
  {
    label: "分析看板",
    key: "dashboard",
    children: [
      {
        label: "DashboardA",
        key: "dashboardA",
        href: "https://en.wikipedia.org/wiki/Hear_the_Wind_Sing",
      },
      {
        label: "DashboardB",
        key: "dashboardB",
        href: "https://en.wikipedia.org/wiki/Hear_the_Wind_Sing",
      },
      {
        label: "DashboardC",
        key: "dashboardC",
        href: "https://en.wikipedia.org/wiki/Hear_the_Wind_Sing",
      },
    ],
    icon: renderIcon(analyticsIcon)
  },
];

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const expandIcon = () => {
  return h(NIcon, null, { default: () => h(caretDownOutline) });
};


</script>

<template>
  <n-space vertical>
    <n-layout has-sider>
      <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed"
        show-trigger @collapse="collapsed = true" @expand="collapsed = false" style="height: calc(100vh - 66px)">
        <n-menu :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22" :options="menuOptions"
          :render-label="renderMenuLabel" :expand-icon="expandIcon" />
      </n-layout-sider>
      <n-layout class="NLayout">
        <RouterView />
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style scoped>
.NLayout {
  padding: 0% 5% 5% 5%;
}
</style>
