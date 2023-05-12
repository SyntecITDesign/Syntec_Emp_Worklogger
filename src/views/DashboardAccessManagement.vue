<script setup>
import {
  NButton,
  NGrid,
  NSpace,
  NGi,
  NDivider,
  NCard,
  NInput,
  NSelect,
  NDataTable,
  NIcon,
} from "naive-ui";
import { useLogInStore } from "../stores/logInStore.js";
import { useAccessStore } from "../stores/accessStore.js";
import { h } from "vue";
import { storeToRefs } from "pinia";
import {
  CloseOutline as DeleteIcon,
  AddOutline as AddIcon,
} from "@vicons/ionicons5";
const logInStore = useLogInStore();
const accessStore = useAccessStore();
const { viewerManagedInfo, projectTagManagedInfo, viewersTags } =
  storeToRefs(logInStore);
const { handleSearch, saveSetting, addProjectTag, deleteProjectTag } =
  accessStore;
const { isEmpListLoading, isSaving } = storeToRefs(accessStore);

projectTagManagedInfo.value.forEach((item, index) => {
  projectTagManagedInfo.value[index][2] = [
    {
      title: "標籤",
      key: "tag",
      align: "center",
      render(row, tagIndex) {
        return h(NInput, {
          value: row.tag,
          onUpdateValue(v) {
            projectTagManagedInfo.value[index][1][tagIndex].tag = v;
          },
        });
      },
    },
    {
      title: "類別",
      key: "group",
      align: "center",
      render(row, tagIndex) {
        return h(NSelect, {
          value: row.group,
          options: Array.from(projectTagManagedInfo.value[index][0]).map(
            (v) => ({
              label: v,
              value: v,
            })
          ),
          filterable: true,
          tag: true,
          onUpdateValue(v) {
            projectTagManagedInfo.value[index][1][tagIndex].group = v;
            projectTagManagedInfo.value[index][0].add(v);
          },
        });
      },
    },
    {
      title: "",
      key: "delete",
      align: "center",
      render(row, tagIndex) {
        return h(
          NButton,
          {
            round: true,
            strong: true,
            secondary: true,
            type: "error",
            size: "small",
            onClick: () => deleteProjectTag(index, tagIndex),
          },
          {
            default: () => {
              return h(NIcon, null, { default: () => h(DeleteIcon) });
            },
          }
        );
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
        <n-card :title="info[0]" size="medium" hoverable>
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

          <n-data-table
            :bordered="false"
            :bottom-bordered="false"
            :columns="projectTagManagedInfo[infoIndex][2]"
            :data="projectTagManagedInfo[infoIndex][1]"
          />
          <template #footer>
            <div style="display: flex; justify-content: center">
              <n-button
                strong
                secondary
                round
                type="success"
                @click="addProjectTag(infoIndex)"
              >
                <template #icon>
                  <n-icon>
                    <add-icon />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </template>
        </n-card>
      </n-gi>
      <n-gi :span="24">
        <div style="display: flex; justify-content: center; margin: 5%">
          <n-button round type="info" @click="saveSetting" :disabled="isSaving">
            儲存
          </n-button>
        </div>
      </n-gi>
    </n-grid>
  </n-space>
</template>
