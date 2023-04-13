<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
const workloadStatisticsSrc = ref("");

onMounted(() => {
  workloadStatisticsSrc.value =
    "https://finereport2.syntecclub.com/WebReport/decision/view/report?viewlet=%25E5%258F%25B0%25E6%25B9%25BE%25E6%258A%25A5%25E8%25A1%25A8%252F%25E5%258F%25B0%25E6%25B9%25BE%25E8%25B5%2584%25E8%25AE%25AF%25E9%2583%25A8%252FIT%25E5%25A0%25B1%25E5%25B7%25A5%25E7%25B3%25BB%25E7%25B5%25B1%25E7%259C%258B%25E6%259D%25BF%252FWorkload%2BStatistics.cpt&op=write" +
    "&p_BjDept=" +
    localStorage.getItem("BjDept") +
    "&p_ProjectKey=" +
    "JT','EED','CMTEST" +
    "&p_Dept50=" +
    localStorage.getItem("dept50") +
    "&p_DeptID=" +
    localStorage.getItem("deptNo");
});
</script>

<template>
  <h1>Workload Statistics</h1>
  <div class="workloadStatistics">
    <iframe :src="workloadStatisticsSrc"></iframe>
  </div>
</template>
<style scoped>
.workloadStatistics {
  display: flex;
  justify-content: center;
}
iframe {
  width: 100%;
  height: 50rem;
}
</style>
