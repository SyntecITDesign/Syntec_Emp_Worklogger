<script setup>
import ContentVue from "../components/Content.vue";
import { h, ref } from "vue";
import { NIcon, NSpace, NLayout, NLayoutSider, NMenu } from "naive-ui";
import {
  Add as addIcon,
  Analytics as analyticsIcon,
  CaretDownOutline as caretDownOutline,
} from "@vicons/ionicons5";

const collapsed = ref(true);

const menuOptions = [
  {
    label: "新增工作日誌",
    key: "addWorkLog",
    href: "https://en.wikipedia.org/wiki/Hear_the_Wind_Sing",
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
  },
];

const renderMenuLabel = (option) => {
  if ("href" in option) {
    return h("a", { href: option.href, target: "_blank" }, [option.label]);
  }
  return option.label;
};
const renderMenuIcon = (option) => {
  if (option.key === "addWorkLog")
    return h(NIcon, null, { default: () => h(addIcon) });
  if (option.key === "dashboard")
    return h(NIcon, null, { default: () => h(analyticsIcon) });
  return null;
};
const expandIcon = () => {
  return h(NIcon, null, { default: () => h(caretDownOutline) });
};
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
        style="height: calc(100vh - 66px)"
      >
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :render-label="renderMenuLabel"
          :render-icon="renderMenuIcon"
          :expand-icon="expandIcon"
        />
      </n-layout-sider>
      <n-layout class="NLayout">
        <ContentVue />
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style scoped>
.NLayout {
  padding: 0% 5% 5% 5%;
}
</style>
