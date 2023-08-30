<script setup>
import { NSpin, NSpace, NScrollbar } from "naive-ui";
import { storeToRefs } from "pinia";
import axios from "axios";
import { watch, ref, onBeforeMount } from "vue";
import { useDashboardStroe } from "../stores/dashboardStroe.js";
const dashboardStroe = useDashboardStroe();
const { CheckIssueUpdateTime, GetSuperDeptOfWorkLogs } = dashboardStroe;
const { isUpdateLatestIssueInfo, isGettingSuperDeptOfWorkLogs } =
  storeToRefs(dashboardStroe);
const issueSummarySrc = ref("");
onBeforeMount(() => {
  CheckIssueUpdateTime();
  GetSuperDeptOfWorkLogs().then((res) => (issueSummarySrc.value = null));
});

watch(
  () => issueSummarySrc.value,
  (newValue) => {
    console.log("watch", newValue);
    issueSummarySrc.value = null;
    issueSummarySrc.value =
      "https://finereport2.syntecclub.com/WebReport/decision/view/report?viewlet=TWST%252FTWST_IT_Dept%252FSYSTEM%252FWorklogger%252FIssue%2BSummary_0829.cpt&op=view" +
      "&p_SuperDeptName=" +
      localStorage.getItem("superDeptsView") +
      "&p_ProjectKey=" +
      localStorage.getItem("projectKeysView");
    console.log("issueSummarySrc", issueSummarySrc.value);
  }
);
</script>

<template>
  <n-scrollbar style="max-height: 100vmin">
    <h1>Issue Summary</h1>
    <n-space vertical
      class="issueSummary">
      <n-spin :show="isUpdateLatestIssueInfo || isGettingSuperDeptOfWorkLogs">
        <iframe :src="issueSummarySrc"></iframe>
        <template #description> 議題資訊更新中 </template>
      </n-spin>
    </n-space>
  </n-scrollbar>
</template>
<style scoped>
.issueSummary {
  background: #ffffffaa;
  display: flex;
  justify-content: center;
}

iframe {
  width: 90%;
  height: 50rem;
}
</style>
