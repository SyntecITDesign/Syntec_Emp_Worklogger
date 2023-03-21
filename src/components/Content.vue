<script setup>
import {
  NForm,
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
} from "naive-ui";
import { ref } from "vue";

const formRef = ref(null);

const size = ref("medium");
const model = ref({
  textareaValue: null,
  selectValue: null,
  dateValue: null,
  switchValue: false,
  inputNumberValue: null,
  tags: ["需求討論"],
});
const generalOptions = ["groode", "veli good", "emazing", "lidiculous"].map(
  (v) => ({
    label: v,
    value: v,
  })
);

const rules = {
  textareaValue: {
    required: true,
    trigger: ["blur", "input"],
    message: "请输入 textareaValue",
  },
  selectValue: {
    required: true,
    trigger: ["blur", "change"],
    message: "请选择 selectValue",
  },
  dateValue: {
    type: "number",
    required: true,
    trigger: ["blur", "change"],
    message: "请输入 dateValue",
  },
  inputNumberValue: {
    type: "number",
    required: true,
    trigger: ["blur", "change"],
    message: "请输入 inputNumberValue",
  },
  tags: {
    type: "array",
    required: true,
    trigger: ["blur", "change"],
    message: "请输入 tags",
  },
};
const handleValidateButtonClick = (e) => {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      console.log("验证成功");
    } else {
      console.log(errors);
      console.log("验证失败");
    }
  });
};
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
    <n-grid :cols="24" :x-gap="24">
      <n-form-item-gi :span="12" label="議題篩選" path="selectValue">
        <n-select
          filterable
          tag
          v-model:value="model.selectValue"
          placeholder="請選擇篩選條件"
          :options="generalOptions"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="議題" path="selectValue">
        <n-select
          v-model:value="model.selectValue"
          placeholder="請選擇議題"
          :options="generalOptions"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="開始日期" path="dateValue">
        <n-date-picker
          v-model:value="model.dateValue"
          type="date"
          placeholder="請選擇日期"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="花費時間" path="inputNumberValue">
        <n-input-number
          v-model:value="model.inputNumberValue"
          placeholder="請輸入天數"
        />
        <span class="spendUnit">天</span>
        <n-input-number
          v-model:value="model.inputNumberValue"
          placeholder="請輸入時數"
        />
        <span class="spendUnit">小時</span>
        <n-input-number
          v-model:value="model.inputNumberValue"
          placeholder="請輸入分鐘數"
        />
        <span class="spendUnit">分鐘</span>
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="非一般議題" path="switchValue">
        <n-switch v-model:value="model.switchValue" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="標籤" path="tags">
        <n-dynamic-tags v-model:value="model.tags" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="工作描述" path="textareaValue">
        <n-input
          v-model:value="model.textareaValue"
          placeholder="請簡單描述工作內容"
          type="textarea"
          :autosize="{
            minRows: 3,
            maxRows: 5,
          }"
        />
      </n-form-item-gi>

      <n-gi :span="24">
        <div style="display: flex; justify-content: flex-end">
          <n-button round type="info" @click="handleValidateButtonClick">
            新增
          </n-button>
        </div>
      </n-gi>
    </n-grid>
  </n-form>
</template>

<style scoped>
.spendUnit {
  margin: 10px;
}
</style>
