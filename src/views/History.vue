<script setup>
import { NSpin, NSpace, NScrollbar } from "naive-ui";
import { storeToRefs } from "pinia";
import axios from "axios";
import { watch, ref, onBeforeMount } from "vue";
const historySrc = ref("");

onBeforeMount(() => {
  historySrc.value =
    "https://finereport2.syntecclub.com/WebReport/decision/view/report?viewlet=TWST%252FTWST_IT_Dept%252FSYSTEM%252FWorklogger%252FWorklog%2BHistory.cpt&op=view" +
    "&p_EmpID=" +
    localStorage.getItem("empID");
});
</script>

<template>
  <n-scrollbar style="max-height: 100vmin">
    <h1>歷史報工紀錄</h1>
    <n-space vertical
      class="history">
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
