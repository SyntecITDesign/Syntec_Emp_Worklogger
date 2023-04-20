<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { NSpace } from "naive-ui";
const textAppear = ref(true);
onMounted(() => {
  setInterval(() => {
    textAppear.value = !textAppear.value;
  }, 50000);
});
</script>

<template>
  <div class="welcome">
    <h1>歡迎使用報工系統<br /><img src="../assets/SyntecLogo.png" /></h1>
  </div>
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
