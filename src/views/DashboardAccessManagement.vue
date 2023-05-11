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
  NDataTable,
} from "naive-ui";
import { useLogInStore } from "../stores/logInStore.js";
import { useAccessStore } from "../stores/accessStore.js";
import { onUpdated, h } from "vue";
import { storeToRefs } from "pinia";
const logInStore = useLogInStore();
const accessStore = useAccessStore();
const { viewerManagedInfo, viewersTags } = storeToRefs(logInStore);
const { handleSearch, saveViewers, addProjectTag } = accessStore;
const { isEmpListLoading, isViewersSaving } = storeToRefs(accessStore);

viewerManagedInfo.value.forEach((projectKey, index) => {
  viewerManagedInfo.value[index][4] = [
    {
      title: "標籤",
      key: "tag",
    },
    {
      title: "類別",
      key: "group",
      render(row, tagIndex) {
        return h(NSelect, {
          value: row.group,
          options: Array.from(viewerManagedInfo.value[index][2]).map((v) => ({
            label: v,
            value: v,
          })),
          filterable: true,
          tag: true,
          onUpdateValue(v) {
            viewerManagedInfo.value[index][3][tagIndex].group = v;
            viewerManagedInfo.value[index][2].add(v);
          },
        });
      },
    },
  ];
});
</script>

<template>
  <h1>權限設置</h1>

  <n-space vertical>
    <n-grid x-gap="12" y-gap="12" :cols="2">
      <n-gi
        v-for="(info, infoIndex) in Array.from(viewerManagedInfo)"
        :key="info"
      >
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
          <n-divider />

          <n-data-table :columns="info[4]" :data="info[3]" />
          <template #footer>
            <n-button round @click="addProjectTag(infoIndex)"> 新增 </n-button>
          </template>
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
