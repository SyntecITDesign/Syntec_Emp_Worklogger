<script setup>
import {
  NButton,
  NGrid,
  NSpace,
  NGi,
  NDivider,
  NCard,
  NTag,
  NSelect,
} from "naive-ui";
import { useLogInStore } from "../stores/logInStore.js";
import { h, onMounted, ref, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
const logInStore = useLogInStore();
const { getJiraWorkLoggerAccess } = logInStore;
const { getEmpInfo } = logInStore;
const { viewerManagedInfo } = storeToRefs(logInStore);
</script>

<template>
  <h1>權限設置</h1>
  <n-space vertical>
    <div v-for="info in Array.from(viewerManagedInfo)" :key="info">
      <h2>{{ info[0] }}</h2>
      <n-select
        v-model:value="info[1]"
        multiple
        :options="info[2]"
        filterable
      />
    </div>
  </n-space>
  <div style="display: flex; justify-content: center; margin: 5%">
    <n-button round type="info"> 儲存 </n-button>
  </div>
</template>
