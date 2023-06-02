<script setup>
import {
  NForm,
  NButton,
  NGrid,
  NFormItemGi,
  NInput,
  NSelect,
  NDatePicker,
  NTimePicker,
  NSpace,
  NGi,
  NInputNumber,
  NDynamicTags,
  NDivider,
  NCard,
  NTag,
} from "naive-ui";
import { onBeforeUpdate } from "vue";
import { storeToRefs } from "pinia";
import { useFormStore } from "../stores/formStore.js";
const formStore = useFormStore();
const {
  formRef,
  size,
  model,
  models,
  spendValue,
  issueOptions,
  tagOptions,
  isIssueOptionsChange,
  isTagOptionsChange,
  isAddingJiraWorklog,
  spendValueStatus,
} = storeToRefs(formStore);
const {
  filterOptions,
  rules,
  handleClose,
  handleValidateButtonClick,
  addJiraWorklog,
  dateDisabled,
} = formStore;
</script>
<template>
  <h1>新增工作日誌</h1>
  <n-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :size="size"
    label-placement="top"
  >
    <n-divider v-if="false" />
    <n-grid :cols="24" :x-gap="24" v-if="false">
      <n-form-item-gi :span="2"></n-form-item-gi>
      <n-form-item-gi :span="5">刪除錯誤報工</n-form-item-gi>
      <n-form-item-gi :span="5" label="議題編號" path="descriptionValue">
        <n-input
          v-model:value="model.descriptionValue"
          placeholder="議題編號"
          type="text"
        />
      </n-form-item-gi>
      <n-form-item-gi :span="5" label="WoklogID" path="descriptionValue">
        <n-input
          v-model:value="model.descriptionValue"
          placeholder="WoklogID"
          type="text"
        />
      </n-form-item-gi>
      <n-form-item-gi :span="5"> </n-form-item-gi>
      <n-form-item-gi :span="2"></n-form-item-gi>
    </n-grid>
    <n-divider v-if="false" />
    <n-grid :cols="24" :x-gap="24">
      <n-form-item-gi :span="12" label="議題篩選" path="selectFilterValue">
        <n-select
          filterable
          tag
          v-model:value="model.selectFilterValue"
          placeholder="請選擇議題類別或輸入議題編號(ex:ICT-999)"
          :options="filterOptions"
          :loading="isIssueOptionsChange"
          :disabled="isIssueOptionsChange"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="議題" path="selectIssueValue">
        <n-select
          filterable
          v-model:value="model.selectIssueValue"
          placeholder="請選擇議題"
          :options="issueOptions"
          :loading="isIssueOptionsChange"
          :disabled="isIssueOptionsChange"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="開始日期時間" path="startDateTimeValue">
        <n-date-picker
          v-model:formatted-value="model.startDateValue"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="請選擇日期"
          :is-date-disabled="dateDisabled"
        />

        <n-time-picker
          v-model:formatted-value="model.startTimeValue"
          type="time"
          time-zone="Asia/Taipei"
          value-format="H:m:s"
          placeholder="請選擇時間"
          v-if="false"
        />
      </n-form-item-gi>
      <n-form-item-gi :span="12" label="花費時間" path="spendValue">
        <n-input-number
          v-model:value="spendValue.spendHourValue"
          placeholder="請輸入時數"
          :status="spendValueStatus.status"
          :min="0"
        />
        <span class="NIputNumberLabel">時</span>
        <n-input-number
          v-model:value="spendValue.spendMinuteValue"
          placeholder="請輸入分鐘數"
          :status="spendValueStatus.status"
          :min="0"
        />
        <span class="NIputNumberLabel">分</span>
      </n-form-item-gi>
      <n-form-item-gi :span="12" label="標籤" path="tagValue">
        <n-select
          v-model:value="model.tagValue"
          placeholder="請選擇工作類型"
          :options="tagOptions"
          :loading="isTagOptionsChange"
          :disabled="isTagOptionsChange"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="工作描述" path="descriptionValue">
        <n-input
          v-model:value="model.descriptionValue"
          placeholder="請簡單描述工作內容"
          type="textarea"
          :autosize="{
            minRows: 3,
            maxRows: 5,
          }"
        />
      </n-form-item-gi>

      <n-gi :span="24">
        <div style="display: flex; justify-content: center">
          <n-button
            round
            @click="handleValidateButtonClick"
            :loading="isAddingJiraWorklog"
            :disabled="isAddingJiraWorklog"
          >
            新增
          </n-button>
        </div>
      </n-gi>
    </n-grid>
  </n-form>
  <n-divider />
  <n-grid x-gap="12" :cols="3">
    <n-gi v-for="(item, index) in models" :key="index">
      <n-card
        :title="item[0].issueID"
        closable
        @close="handleClose(index)"
        :segmented="{
          content: true,
          footer: 'soft',
        }"
      >
        <template #header-extra>
          <n-tag type="success">
            {{ item[0].type }}
          </n-tag>
          <n-tag type="info">
            {{ item[0].tags }}
          </n-tag>
        </template>
        {{ item[0].comment }}
        <template #footer>
          開始日期：{{ item[0].started.split(" ")[0] }}<br />
          花費時間：{{ item[0].spendHour }}小時{{ item[0].spendMinute }}分鐘
        </template>
      </n-card>
    </n-gi>
    <n-gi :span="24">
      <div
        v-if="models.length > 0"
        style="display: flex; justify-content: flex-end; margin: 5%"
      >
        <n-button
          round
          type="info"
          @click="addJiraWorklog"
          :loading="isAddingJiraWorklog"
          :disabled="isAddingJiraWorklog"
        >
          送出
        </n-button>
      </div>
    </n-gi>
  </n-grid>
</template>

<style scoped>
.NIputNumberLabel {
  margin: 0 1%;
}
</style>
