<script setup>
import { NSpin, NSpace, NScrollbar } from "naive-ui";
import { storeToRefs } from "pinia";
import axios from "axios";
import { watch, ref, onBeforeMount } from "vue";
const historySrc = ref("");

onBeforeMount(() => {
  historySrc.value =
    "https://finereport2.syntecclub.com/WebReport/decision/view/report?viewlet=%25E5%258F%25B0%25E6%25B9%25BE%25E6%258A%25A5%25E8%25A1%25A8%252F%25E5%258F%25B0%25E6%25B9%25BE%25E8%25B5%2584%25E8%25AE%25AF%25E9%2583%25A8%252FIT%25E5%25A0%25B1%25E5%25B7%25A5%25E7%25B3%25BB%25E7%25B5%25B1%25E7%259C%258B%25E6%259D%25BF%252FWorklog%2BHistory.cpt&ref_t=design&op=view&" +
    "p_EmpID=" +
    localStorage.getItem("empID");
});
</script>

<template>
  <n-scrollbar style="max-height: 100vmin">
    <h1>歷史報工紀錄</h1>
    <n-space vertical class="history">
      <iframe :src="historySrc"></iframe>
    </n-space>
  </n-scrollbar>
</template>
<style scoped>
.history {
  background: #ffffffab;
  display: flex;
  justify-content: center;
}
iframe {
  width: 100%;
  height: 50rem;
}
</style>
