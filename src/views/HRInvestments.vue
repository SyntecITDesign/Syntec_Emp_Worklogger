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
const HRInvestmentsSrc = ref(null);
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
    HRInvestmentsSrc.value = null;
    HRInvestmentsSrc.value =
      "https://finereport2.syntecclub.com/WebReport/Nologin.html?id=https://finereport2.syntecclub.com/WebReport/decision/view/report?viewlet=%25E5%258F%25B0%25E6%25B9%25BE%25E6%258A%25A5%25E8%25A1%25A8%252F%25E5%258F%25B0%25E6%25B9%25BE%25E8%25B5%2584%25E8%25AE%25AF%25E9%2583%25A8%252FIT%25E5%25A0%25B1%25E5%25B7%25A5%25E7%25B3%25BB%25E7%25B5%25B1%25E7%259C%258B%25E6%259D%25BF%252FHR%2BInvestments.cpt&op=view" +
      "&p_SuperDeptName=" +
      selectedSuperDeptName.value +
      "&p_ProjectKey=" +
      localStorage.getItem("projectKeysView");
  }
);
</script>

<template>
  <n-scrollbar style="max-height: 100vmin">
    <h1>
      HR Investments<n-select
        v-model:value="selectedSuperDeptName"
        :options="superDeptNameOptions"
        size="large"
      />
    </h1>
    <n-space vertical class="HRInvestments">
      <n-spin :show="isUpdateLatestIssueInfo || isGettingSuperDeptOfWorkLogs">
        <iframe
          :src="HRInvestmentsSrc"
          v-if="HRInvestmentsSrc !== null"
        ></iframe>

        <template #description> 議題資訊更新中 </template>
      </n-spin>
    </n-space>
  </n-scrollbar>
</template>
<style scoped>
.HRInvestments {
  background: #ffffffaa;
  display: flex;
  justify-content: center;
}
iframe {
  width: 90%;
  height: 50rem;
}
</style>
