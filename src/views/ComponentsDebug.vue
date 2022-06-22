<template>
  <div class="debug-container">
    <advanced-editor :value="code.value" :language="'javascript'" :fullscreen="true"></advanced-editor>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue';
import AdvancedEditor from '../components/AdvancedEditor.vue';
const code = reactive({ value: '// hello \nvar a=0' });

</script>
<style scoped lang="scss">
.debug-container {
  height: 80vh;
}
</style>
