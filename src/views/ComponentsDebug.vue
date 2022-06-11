<template>
  <div class="debug-container">
    <n-button @click="test">123</n-button>
    <advanced-editor :value="code.value"></advanced-editor>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue';
import { NButton, useLoadingBar } from 'naive-ui';
import AdvancedEditor from '../components/AdvancedEditor.vue';
const code = reactive({ value: '123' });
const loadingBar = useLoadingBar();
function test() {
  loadingBar.start();
  loadingBar.finish();
}
</script>
<style scoped lang="scss">
.debug-container {
  height: 100%;
}
</style>
