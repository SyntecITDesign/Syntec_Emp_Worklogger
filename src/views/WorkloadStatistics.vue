<script setup>
import { NSpin, NSpace, NScrollbar } from "naive-ui";
import { storeToRefs } from "pinia";
import axios from "axios";
import { ref, onBeforeMount, watch } from "vue";
import { useDashboardStroe } from "../stores/dashboardStroe.js";
const dashboardStroe = useDashboardStroe();
const { CheckIssueUpdateTime, GetSuperDeptOfWorkLogs } = dashboardStroe;
const { isUpdateLatestIssueInfo, isGettingSuperDeptOfWorkLogs } =
  storeToRefs(dashboardStroe);
const workloadStatisticsSrc = ref("");

onBeforeMount(() => {
  CheckIssueUpdateTime();
  GetSuperDeptOfWorkLogs().then((res) => (workloadStatisticsSrc.value = null));
});

watch(
  () => workloadStatisticsSrc.value,
  (newValue) => {
    console.log("watch", newValue);
    workloadStatisticsSrc.value =
      "https://finereport2.syntecclub.com/WebReport/Nologin.html?id=https://finereport2.syntecclub.com/WebReport/decision/view/report?viewlet=%25E5%258F%25B0%25E6%25B9%25BE%25E6%258A%25A5%25E8%25A1%25A8%252F%25E5%258F%25B0%25E6%25B9%25BE%25E8%25B5%2584%25E8%25AE%25AF%25E9%2583%25A8%252FIT%25E5%25A0%25B1%25E5%25B7%25A5%25E7%25B3%25BB%25E7%25B5%25B1%25E7%259C%258B%25E6%259D%25BF%252FWorkload%2BStatistics.cpt&op=write" +
      "&p_SuperDeptName=" +
      localStorage.getItem("superDeptsView") +
      "&p_ProjectKey=" +
      localStorage.getItem("projectKeysView");
    console.log("workloadStatisticsSrc", workloadStatisticsSrc.value);
  }
);
</script>

<template>
  <n-scrollbar style="max-height: 100vmin">
    <h1>Workload Statistics</h1>
    <n-space vertical class="workloadStatistics">
      <n-spin :show="isUpdateLatestIssueInfo || isGettingSuperDeptOfWorkLogs">
        <iframe :src="workloadStatisticsSrc"></iframe>
        <template #description> 議題資訊更新中 </template>
      </n-spin>
    </n-space></n-scrollbar
  >
</template>
<style scoped>
.workloadStatistics {
  background: #ffffffaa;
  display: flex;
  justify-content: center;
}
iframe {
  width: 100%;
  height: 50rem;
}
</style>
