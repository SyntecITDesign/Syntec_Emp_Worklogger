import { h, ref, computed } from 'vue'
import { RouterLink} from "vue-router";
import { defineStore,storeToRefs } from 'pinia'
import { NIcon } from "naive-ui";
import {
    Add as addIcon,
    Analytics as analyticsIcon,
    HomeOutline as homeIcon,
    CaretDownOutline as caretDownOutline,
  } from "@vicons/ionicons5";


export const useSiderStore = defineStore('siderStore', () => {
    const collapsed = ref(true);
    
    const isManager = ref(false);
    const isLogIn = ref(false);
      const empID = ref("");
      
      const mmenuOptions = [
        {
          label: "且听风吟",
          key: "hear-the-wind-sing",
          href: "https://baike.baidu.com/item/%E4%B8%94%E5%90%AC%E9%A3%8E%E5%90%9F/3199"
        },        
        {
          label: "舞，舞，舞",
          key: "dance-dance-dance",
          children: [
            {
              label: "叙事者",
              key: "narrator"
            },
            {
              label: "羊男",
              key: "sheep-man"
            }                          
          ]
        }
      ];
      



      const menuOptions = computed(() => [
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
          show:isManager.value,
          children: [            
            {
              label: () =>
                h(
                  RouterLink,
                  {
                    to: {
                      name: "worklogDetails",
                      params: {
                        lang: "zh-CN",
                      },
                    },
                  },
                  { default: () => "Worklog Details" }
                ),
              key: "go-WorklogDetails",
            },
            {
              label: () =>
                h(
                  RouterLink,
                  {
                    to: {
                      name: "workloadStatistics",
                      params: {
                        lang: "zh-CN",
                      },
                    },
                  },
                  { default: () => "Workload Statistics" }
                ),
              key: "go-WorkloadStatistics",
            },
            {
              label: () =>
                h(
                  RouterLink,
                  {
                    to: {
                      name: "issueSummary",
                      params: {
                        lang: "zh-CN",
                      },
                    },
                  },
                  { default: () => "Issue Summary" }
                ),
              key: "go-IssueSummary",
            },
            {
              label: () =>
                h(
                  RouterLink,
                  {
                    to: {
                      name: "HRInvestments",
                      params: {
                        lang: "zh-CN",
                      },
                    },
                  },
                  { default: () => "HR Investments" }
                ),
              key: "go-HRInvestments",
            },
          ],
          icon: renderIcon(analyticsIcon),
        },
      ]);


      const renderMenuLabel = (option) => {
        if ("href" in option) {
          return h(
            "a",
            { href: option.href, target: "_blank" },
            option.label
          );
        }
        return option.label;
      };
      
      const renderIcon = (icon) => {
        return () => h(NIcon, null, { default: () => h(icon) });
      };
      
      const expandIcon = () => {
        return h(NIcon, null, { default: () => h(caretDownOutline) });
      };
    return { collapsed, menuOptions, isLogIn, isManager, empID, renderIcon, expandIcon, renderMenuLabel, mmenuOptions}
})
