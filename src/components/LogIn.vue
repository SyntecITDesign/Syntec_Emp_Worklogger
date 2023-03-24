<script setup>
import { defineComponent, ref } from "vue";
import { storeToRefs } from "pinia";
import { NSpace, NInput, NButton, NForm, NFormItem } from "naive-ui";
import { GlassesOutline } from "@vicons/ionicons5";
import { useSiderStore } from "../stores/siderStore.js";
import axios from "axios";
import { encode } from "js-base64";
import { onBeforeMount } from "vue";

const siderStore = useSiderStore();
const { isLogIn } = storeToRefs(siderStore);
const formRef = ref(null);
const apiUrl = "https://localhost:44303/SyntecIT/api/v1";
const model = ref({
  Username: null,
  Password: null,
});

const rules = {
  Username: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "請輸入帳號",
    },
  ],
  Password: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "請輸入密碼",
    },
  ],
};

const handleValidateButtonClick = (e) => {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      jiraLogin();
    } else {
      console.log("未輸入帳號密碼");
    }
  });
};

const jiraLogin = async () => {
  try {
    const res = await axios.post(
      apiUrl + "/Open/JIRA_Related/Worklogger/JiraLogIn",
      model.value
    );
    console.log(res.data);
    localStorage.setItem(
      "token",
      encode(model.value.Username + ":" + model.value.Password)
    );
    localStorage.setItem("loginTime", new Date().getTime());
    isLogIn.value = true;
  } catch (err) {
    console.log(err);
  }
};
onBeforeMount(() => {
  localStorage.clear();
});
</script>

<template>
  <n-space vertical class="NSpace">
    登入頁面
    <n-form ref="formRef" :model="model" :rules="rules">
      <n-form-item path="Username" label="JIRA登入帳號">
        <n-input
          class="NInput"
          type="text"
          size="large"
          v-model:value="model.Username"
          @keydown.enter.prevent
          placeholder="帳號"
        />
      </n-form-item>
      <n-form-item path="Password" label="JIRA登入密碼">
        <n-input
          class="NInput"
          type="password"
          size="large"
          show-password-on="mousedown"
          v-model:value="model.Password"
          @keydown.enter.prevent
          placeholder="密碼"
        />
      </n-form-item>
    </n-form>

    <template #password-visible-icon>
      <n-icon :size="16" :component="GlassesOutline" />
    </template>
    <n-button size="large" @click="handleValidateButtonClick">登入</n-button>
  </n-space>
</template>

<style scoped>
.NSpace {
  margin: 10% 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50px;
}
.NInput {
  width: 600px;
  font-size: 30px;
  padding: 10px;
}
</style>
