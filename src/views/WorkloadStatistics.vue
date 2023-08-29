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
      "https://finereport2.syntecclub.com/WebReport/decision/view/report?viewlet=TWST%252FTWST_IT_Dept%252FSYSTEM%252FWorklogger%252FWorkload%2BStatistics.cpt&op=write" +
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
    <n-space vertical
      class="workloadStatistics">
      <n-spin :show="isUpdateLatestIssueInfo || isGettingSuperDeptOfWorkLogs">
        <iframe :src="workloadStatisticsSrc"></iframe>
        <template #description> 議題資訊更新中 </template>
      </n-spin>
    </n-space>
  </n-scrollbar>
</template>
<style scoped>
.workloadStatistics {
  background: #ffffffaa;
  display: flex;
  justify-content: center;
}

iframe {
  width: 90%;
  height: 50rem;
}
</style>
