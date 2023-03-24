import { h, ref } from 'vue'
import { RouterLink} from "vue-router";
import { defineStore } from 'pinia'
import { NIcon } from "naive-ui";
import {
    Add as addIcon,
    Analytics as analyticsIcon,
    HomeOutline as homeIcon,
    CaretDownOutline as caretDownOutline,
  } from "@vicons/ionicons5";

export const useSiderStore = defineStore('siderStore', () => {
      const collapsed = ref(true);
      const isLogIn = ref(false);
      const menuOptions = [
        {
          label: () =>
            h(
              RouterLink,
              {
                to: {
                  name: "home",
                  params: {
                    lang: "zh-CN",
                  },
                },
              },
              { default: () => "首頁" }
            ),
          key: "go-back-home",
          icon: renderIcon(homeIcon),
        },
        {
          label: () =>
            h(
              RouterLink,
              {
                to: {
                  name: "addWorklogForm",
                  params: {
                    lang: "zh-CN",
                  },
                },
              },
              { default: () => "新增工作日誌" }
            ),
          key: "go-AddWorkForm",
          icon: renderIcon(addIcon),
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
          icon: renderIcon(analyticsIcon),
        },
      ];
      
      function renderIcon(icon) {
        return () => h(NIcon, null, { default: () => h(icon) });
      }
      
      const expandIcon = () => {
        return h(NIcon, null, { default: () => h(caretDownOutline) });
      };
    return { collapsed, menuOptions, isLogIn, renderIcon, expandIcon, }
})
