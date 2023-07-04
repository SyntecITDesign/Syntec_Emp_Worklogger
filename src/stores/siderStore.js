import { h, ref, computed } from 'vue'
import { RouterLink} from "vue-router";
import { defineStore,storeToRefs } from 'pinia'
import { useLogInStore } from "../stores/logInStore.js";
import { NIcon,NButton } from "naive-ui";
import {
    Add as addIcon,
    Analytics as analyticsIcon,
    HomeOutline as homeIcon,
    CaretDownOutline as caretDownOutline,
    Accessibility as lockAccessIcon,
    RecordingOutline as recordingIcon,
    ExitOutline as exitIcon,
  } from "@vicons/ionicons5";


export const useSiderStore = defineStore('siderStore', () => {
    const logInStore = useLogInStore();
    const { access, welcomeText } = storeToRefs(logInStore);
    const collapsed = ref(true);
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
            { default: () => welcomeText.value }
          ),
        key: "go-back-home",
        icon: renderIcon(homeIcon),
      }
      ,{
        key: "divider-1",
        type: "divider",
        props: {
          style: {
            marginLeft: "32px"
          }
        }
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
        show:access.value.isViewer,
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
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    name: "issueExecution",
                    params: {
                      lang: "zh-CN",
                    },
                  },
                },
                { default: () => "Issue Execution" }
              ),
            key: "go-issueExecution",
          },
        ],
        icon: renderIcon(analyticsIcon),
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: "dashboardAccessManagement",
                params: {
                  lang: "zh-CN",
                },
              },
            },
            { default: () => "權限及標籤管理" }
          ),
        key: "go-DashboardAccessManagement",
        show:access.value.isViewersManager,
        icon: renderIcon(lockAccessIcon),
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: "history",
                params: {
                  lang: "zh-CN",
                },
              },
            },
            { default: () => "歷史報工紀錄" }
          ),
        key: "go-history",
        icon: renderIcon(recordingIcon),
      },
      {
        key: "divider-1",
        type: "divider",
        props: {
          style: {
            marginLeft: "32px"
          }
        }
      },
      {
        label: () =>
          h(
            "a",
            {
              onClick: () => logOut(),
            },
            "登出"
          ),
          icon: renderIcon(exitIcon),
      }
    ]);

    
    const logOut = () => {
      access.value.basicAuth = null;
      access.value.isLogIn = false;
      localStorage.clear();
    };

    const renderIcon = (icon) => {
      return () => h(NIcon, null, { default: () => h(icon) });
    };
    
    const expandIcon = () => {
      return h(NIcon, null, { default: () => h(caretDownOutline) });
    };
    return { collapsed, menuOptions, renderIcon, expandIcon}
})
