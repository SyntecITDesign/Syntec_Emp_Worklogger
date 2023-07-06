<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useSiderStore } from "../stores/siderStore.js";
import { storeToRefs } from "pinia";
import { NSpace, NScrollbar } from "naive-ui";
const siderStore = useSiderStore();
const { wholeTheme } = storeToRefs(siderStore);
const textAppear = ref(true);
onMounted(() => {
  setInterval(() => {
    textAppear.value = !textAppear.value;
  }, 50000);
});
</script>

<template>
  <n-scrollbar style="max-height: 40rem">
    <div class="welcome">
      <h1>
        歡迎使用報工系統<br /><img
          v-if="wholeTheme"
          src="../assets/SyntecLogo.png"
        /><img v-else src="../assets/SyntecLogoDark.png" />
      </h1>
    </div>
  </n-scrollbar>
</template>

<style scoped>
.welcome {
  margin: 10% 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
}
h1 {
  text-align: center;
}
img {
  width: 100%;
}
</style>
