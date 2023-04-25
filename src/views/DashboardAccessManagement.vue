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
import { useAccessStore } from "../stores/accessStore.js";
import {} from "vue";
import { storeToRefs } from "pinia";
const logInStore = useLogInStore();
const accessStore = useAccessStore();
const { viewerManagedInfo, viewersTags } = storeToRefs(logInStore);
const { handleSearch, saveViewers } = accessStore;
const { isEmpListLoading, isViewersSaving } = storeToRefs(accessStore);
</script>

<template>
  <h1>權限設置</h1>

  <n-space vertical>
    <n-grid x-gap="12" y-gap="12" :cols="2">
      <n-gi v-for="info in Array.from(viewerManagedInfo)" :key="info">
        <n-card :title="info[0]" size="huge">
          <n-select
            v-model:value="info[1]"
            multiple
            :options="viewersTags"
            filterable
            placeholder="查詢工號"
            :loading="isEmpListLoading"
            clearable
            remote
            :clear-filter-after-select="false"
            @search="handleSearch"
            size="large"
            max-tag-count="responsive"
          />
        </n-card>
      </n-gi>
      <n-gi :span="24">
        <div style="display: flex; justify-content: center; margin: 5%">
          <n-button
            round
            type="info"
            @click="saveViewers"
            :disabled="isViewersSaving"
          >
            儲存
          </n-button>
        </div>
      </n-gi>
    </n-grid>
  </n-space>
</template>
