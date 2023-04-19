<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { useLogInStore } from "../stores/logInStore.js";
const logInStore = useLogInStore();
const { qualifiedTitleList } = logInStore;
const worklogDetailsSrc = ref("");

onMounted(() => {
  let p_DeptID = qualifiedTitleList.includes(localStorage.getItem("title"))
    ? ""
    : localStorage.getItem("deptNo");
  let p_Dept50 =
    qualifiedTitleList.includes(localStorage.getItem("title")) &&
    !["課長", "處長"].includes(localStorage.getItem("title"))
      ? ""
      : localStorage.getItem("dept50");
  worklogDetailsSrc.value =
    "https://finereport2.syntecclub.com/WebReport/decision/view/report?viewlet=%25E5%258F%25B0%25E6%25B9%25BE%25E6%258A%25A5%25E8%25A1%25A8%252F%25E5%258F%25B0%25E6%25B9%25BE%25E8%25B5%2584%25E8%25AE%25AF%25E9%2583%25A8%252FIT%25E5%25A0%25B1%25E5%25B7%25A5%25E7%25B3%25BB%25E7%25B5%25B1%25E7%259C%258B%25E6%259D%25BF%252FWorklog%2BDetails.cpt&op=view" +
    "&p_BjDept=" +
    localStorage.getItem("BjDept") +
    "&p_ProjectKey=" +
    "JT','EED','CMTEST" +
    "&p_Dept50=" +
    p_Dept50 +
    "&p_DeptID=" +
    p_DeptID;
});
</script>

<template>
  <h1>Worklog Details</h1>
  <div class="worklogDetails">
    <iframe :src="worklogDetailsSrc"></iframe>
  </div>
</template>
<style scoped>
.worklogDetails {
  display: flex;
  justify-content: center;
}
iframe {
  width: 100%;
  height: 50rem;
}
</style>
