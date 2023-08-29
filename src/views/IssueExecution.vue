<script setup>
import { NSpin, NSpace, NSelect, NScrollbar } from "naive-ui";
import { storeToRefs } from "pinia";
import axios from "axios";
import { ref, onBeforeMount, watch } from "vue";
import { useDashboardStroe } from "../stores/dashboardStroe.js";
const dashboardStroe = useDashboardStroe();
const { CheckIssueUpdateTime, GetSuperDeptOfWorkLogs } = dashboardStroe;
const { isUpdateLatestIssueInfo, isGettingSuperDeptOfWorkLogs } =
  storeToRefs(dashboardStroe);
const issueExecutionSrc = ref(null);
const selectedSuperDeptName = ref(null);
const superDeptNameOptions = ref(
  localStorage
    .getItem("superDeptsView")
    .split("',N'")
    .map((v) => ({
      label: v,
      value: v,
    }))
);
onBeforeMount(() => {
  CheckIssueUpdateTime();
  GetSuperDeptOfWorkLogs();
});
watch(
  () => selectedSuperDeptName.value,
  (newValue) => {
    console.log("watch", newValue);
    issueExecutionSrc.value = null;
    issueExecutionSrc.value =
      "https://finereport2.syntecclub.com/WebReport/decision/view/report?viewlet=TWST%252FTWST_IT_Dept%252FSYSTEM%252FWorklogger%252FIssue%2BExecution.cpt&op=view" +
      "&p_SuperDeptName=" +
      selectedSuperDeptName.value +
      "&p_ProjectKey=" +
      localStorage.getItem("projectKeysView");
  }
);
</script>

<template>
  <n-scrollbar style="max-height: 100vmin">
    <h1> Issue Execution<n-select v-model:value="selectedSuperDeptName"
        :options="superDeptNameOptions"
        size="large" />
    </h1>
    <n-space vertical
      class="issueExecution">
      <n-spin :show="isUpdateLatestIssueInfo || isGettingSuperDeptOfWorkLogs">
        <iframe :src="issueExecutionSrc"
          v-if="issueExecutionSrc !== null"></iframe>
        <template #description> 議題資訊更新中 </template>
      </n-spin>
    </n-space>
  </n-scrollbar>
</template>
<style scoped>
.issueExecution {
  background: #ffffffaa;
  display: flex;
  justify-content: center;
}

iframe {
  width: 90%;
  height: 50rem;
}
</style>
