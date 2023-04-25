<script setup>
import { NSelect } from "naive-ui";
import axios from "axios";
import { onMounted, ref, watch } from "vue";
const HRInvestmentsSrc = ref(null);
const selectedSuperDeptName = ref(null);
const superDeptNameOptions = ref(
  localStorage
    .getItem("superDeptsView")
    .split("','")
    .map((v) => ({
      label: v,
      value: v,
    }))
);

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
  <h1>
    HR Investments<n-select
      v-model:value="selectedSuperDeptName"
      :options="superDeptNameOptions"
      size="large"
    />
  </h1>

  <div class="HRInvestments">
    <iframe :src="HRInvestmentsSrc" v-if="HRInvestmentsSrc !== null"></iframe>
  </div>
</template>
<style scoped>
.HRInvestments {
  display: flex;
  justify-content: center;
}
iframe {
  width: 100%;
  height: 50rem;
}
</style>
