<template>
  <div class="debug-container">
    <advanced-editor :value="code.value"></advanced-editor>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue';
import AdvancedEditor from '../components/AdvancedEditor.vue';
const code=reactive({ value: '123' });
</script>
<style scoped lang="scss">
.debug-container{
  height: 100%;
}
</style>
