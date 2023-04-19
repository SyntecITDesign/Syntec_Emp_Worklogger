<script setup>
import {
  NButton,
  NGrid,
  NSpace,
  NGi,
  NDynamicTags,
  NDivider,
  NCard,
  NInput,
} from "naive-ui";
import { useLogInStore } from "../stores/logInStore.js";
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
const logInStore = useLogInStore();
const { getJiraWorkLoggerAccess } = logInStore;
const { getEmpInfo } = logInStore;
const { viewersManageInfo } = storeToRefs(logInStore);

onMounted(() => {
  getJiraWorkLoggerAccess("getViewersManagementInfo", {
    Managers: "%" + localStorage.getItem("empID") + "%",
  });

  console.log(viewersManageInfo.value);
});
</script>

<template>
  權限設置(未完成)
  <!-- <n-space vertical>
    <n-input type="text" v-model:value="viewersManageInfo" />
  </n-space> -->
</template>
