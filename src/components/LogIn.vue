<script setup>
import { storeToRefs } from "pinia";
import { NSpace, NInput, NButton, NForm, NFormItem } from "naive-ui";
import { GlassesOutline } from "@vicons/ionicons5";
import { onBeforeMount } from "vue";
import { useLogInStore } from "../stores/logInStore.js";

const logInStore = useLogInStore();
const { formRef, model, access } = storeToRefs(logInStore);
const { rules, handleValidateButtonClick } = logInStore;

onBeforeMount(() => {
  if (window.location.href.split("#")[1].length > 1) {
    window.location.assign("/");
  }
  access.value = {
    isLogIn: false,
    isViewer: false,
    isViewersManager: false,
    basicAuth: null,
    isChecking: false,
  };
  localStorage.clear();
  console.log(import.meta.env.VITE_BACKEND_HOST);
});
</script>

<template>
  <n-space
    vertical
    class="NSpace"
    @keyup.enter="handleValidateButtonClick"
    @blur="handleValidateButtonClick"
  >
    登入頁面
    <n-form ref="formRef" :model="model" :rules="rules">
      <n-form-item path="Username" label="JIRA登入帳號">
        <n-input
          class="NInput"
          type="text"
          size="large"
          v-model:value="model.Username"
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
          placeholder="密碼"
        />
      </n-form-item>
    </n-form>

    <template #password-visible-icon>
      <n-icon :size="16" :component="GlassesOutline" />
    </template>
    <n-button
      size="large"
      @click="handleValidateButtonClick"
      :loading="access.isChecking"
      :disabled="access.isChecking"
      >登入</n-button
    >
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
