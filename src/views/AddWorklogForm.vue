<script setup>
import {
  NForm,
  NButton,
  NGrid,
  NFormItemGi,
  NInput,
  NSelect,
  NDatePicker,
  NSwitch,
  NSpace,
  NGi,
  NInputNumber,
  NDynamicTags,
  NDivider,
  NCard,
} from "naive-ui";

import { ref } from "vue";
import { storeToRefs } from 'pinia';
import { useFormStore } from "../stores/formStore.js";
const formStore = useFormStore();
const { formRef, size, model } = storeToRefs(formStore);
const { filterOptions, issueOptions, rules, Options, handleClose, handleValidateButtonClick } = formStore;

</script>
<template>
  <h1>新增工作日誌</h1>
  <n-form ref="formRef" :model="model" :rules="rules" :size="size" label-placement="top">
    <n-grid :cols="24" :x-gap="24">
      <n-form-item-gi :span="12" label="議題篩選" path="selectFilterValue">
        <n-select filterable tag v-model:value="model.selectFilterValue" placeholder="請選擇篩選條件" :options="filterOptions" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="議題" path="selectIssueValue">
        <n-select v-model:value="model.selectIssueValue" placeholder="請選擇議題" :options="issueOptions" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="開始日期" path="startDateValue">
        <n-date-picker v-model:value="model.startDateValue" type="date" placeholder="請選擇日期" />
      </n-form-item-gi>

      <n-form-item-gi :span="4" label="花費天數" path="spendDayValue">
        <n-input-number v-model:value="model.spendDayValue" placeholder="請輸入天數" :min="0" />
      </n-form-item-gi>
      <n-form-item-gi :span="4" label="花費時數" path="spendHourValue">
        <n-input-number v-model:value="model.spendHourValue" placeholder="請輸入時數" :min="0" />
      </n-form-item-gi>
      <n-form-item-gi :span="4" label="花費分鐘" path="spendMinuteValue">
        <n-input-number v-model:value="model.spendMinuteValue" placeholder="請輸入分鐘數" :min="0" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="非一般議題" path="switchToGeneralValue">
        <n-switch v-model:value="model.switchToGeneralValue" />
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

<style scoped></style>
