<script setup>
import {
  NForm,
  NButton,
  NGrid,
  NFormItemGi,
  NInput,
  NSelect,
  NDatePicker,
  NSpace,
  NGi,
  NInputNumber,
  NDynamicTags,
  NDivider,
  NCard,
} from "naive-ui";
import { onBeforeUpdate } from 'vue'
import { storeToRefs } from 'pinia';
import { useFormStore } from "../stores/formStore.js";
const formStore = useFormStore();
const { formRef, size, model, spendValue, issueOptions, IsIssueOptionsChange, spendValueStatus } = storeToRefs(formStore);
const { filterOptions, rules, Options, handleClose, handleValidateButtonClick } = formStore;


</script>
<template>
  <h1>新增工作日誌</h1>
  <n-form ref="formRef" :model="model" :rules="rules" :size="size" label-placement="top">
    <n-grid :cols="24" :x-gap="24">
      <n-form-item-gi :span="12" label="議題篩選" path="selectFilterValue">
        <n-select filterable tag v-model:value="model.selectFilterValue" placeholder="請選擇議題類別或輸入議題編號(ex:ICT-999)"
          :options="filterOptions" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="議題" path="selectIssueValue">
        <n-select v-model:value="model.selectIssueValue" placeholder="請選擇議題" :options="issueOptions"
          :loading="IsIssueOptionsChange" :disabled="IsIssueOptionsChange" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="開始日期" path="startDateValue">
        <n-date-picker v-model:value="model.startDateValue" type="date" placeholder="請選擇日期" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="花費時間" path="spendValue">
        <n-input-number v-model:value="spendValue.spendDayValue" placeholder="請輸入天數" :status="spendValueStatus.status"
          :min="0" />
        <span class="NIputNumberLabel">日</span>
        <n-input-number v-model:value="spendValue.spendHourValue" placeholder="請輸入時數" :status="spendValueStatus.status"
          :min="0" />
        <span class="NIputNumberLabel">時</span>
        <n-input-number v-model:value="spendValue.spendMinuteValue" placeholder="請輸入分鐘數" :status="spendValueStatus.status"
          :min="0" />
        <span class="NIputNumberLabel">分</span>
      </n-form-item-gi>
      <n-form-item-gi :span="12" label="標籤" path="tags">
        <n-dynamic-tags v-model:value="model.tags" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="工作描述" path="descriptionValue">
        <n-input v-model:value="model.descriptionValue" placeholder="請簡單描述工作內容" type="textarea" :autosize="{
          minRows: 3,
          maxRows: 5,
        }" />
      </n-form-item-gi>

      <n-gi :span="24">
        <div style="display: flex; justify-content: flex-end;">
          <n-button round type="primary" @click="handleValidateButtonClick">
            新增
          </n-button>
        </div>
      </n-gi>
    </n-grid>
  </n-form>
  <n-divider />
  <n-card v-for="(item, index) in Options" :key=item title="卡片" closable @close="handleClose(index)">
    {{ item }}
  </n-card>
</template>

<style scoped>
.NIputNumberLabel {
  margin: 0 1%;
}
</style>
