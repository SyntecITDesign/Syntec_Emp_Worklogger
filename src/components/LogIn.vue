<script setup>
import {
  NSpace,
  NInput,
  NButton,
  NForm,
  NFormItem,
  NScrollbar,
  NIcon,
} from "naive-ui";
import { GlassesOutline } from "@vicons/ionicons5";
import { onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useLogInStore } from "../stores/logInStore.js";
import { useSiderStore } from "../stores/siderStore.js";
const siderStore = useSiderStore();
const { wholeTheme } = storeToRefs(siderStore);
const logInStore = useLogInStore();
const { formRef, model, access } = storeToRefs(logInStore);
const { rules, handleValidateButtonClick, checkLogInTime } = logInStore;

onBeforeMount(() => {
  if (window.location.href.split("#")[1].length > 1) {
    window.location.assign("/");
  }
  console.log(import.meta.env.VITE_BACKEND_HOST);
  checkLogInTime();
});
</script>

<template>
  <n-scrollbar style="max-height: 100vmin">
    <n-space vertical
      class="NSpace"
      @keyup.enter="handleValidateButtonClick"
      @blur="handleValidateButtonClick"><img class="logo"
        v-if="wholeTheme"
        src="../assets/SyntecLogo.png" /><img class="logo"
        v-else
        src="../assets/SyntecLogoDark.png" /> 報工系統登入頁面 <n-form ref="formRef"
        :model="model"
        :rules="rules">
        <n-form-item path="Username"
          label="JIRA登入帳號">
          <n-input class="NInput"
            type="text"
            size="large"
            v-model:value="model.Username"
            placeholder="帳號" />
        </n-form-item>
        <n-form-item path="Password"
          label="JIRA登入密碼">
          <n-input class="NInput"
            type="password"
            size="large"
            show-password-on="mousedown"
            v-model:value="model.Password"
            placeholder="密碼" />
        </n-form-item>
      </n-form>
      <template #password-visible-icon>
        <n-icon :size="16"
          :component="GlassesOutline" />
      </template>
      <n-button size="large"
        @click="handleValidateButtonClick"
        :loading="access.isChecking"
        :disabled="access.isChecking">登入</n-button>
    </n-space>
  </n-scrollbar>
</template>

<style scoped>
.NSpace {
  margin: 0% 20%;
  display: flex;
  align-items: center;
  font-size: 50px;
}

.logo {
  width: 95%;
  margin-top: 5%;
  margin-left: 5%;
}

.NInput {
  width: 600px;
  font-size: 30px;
  padding: 10px;
}
</style>
