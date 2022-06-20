<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as monaco from 'monaco-editor';
const container = ref<HTMLDivElement | null>(null); let editor: monaco.editor.IStandaloneCodeEditor | null = null;

defineExpose({
  editor,
});

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['update:value']);

onMounted(function () {
  if (!container.value) return;
  editor = monaco.editor.create(container.value, {
    value: props.value,
    language: 'javascript',
    theme: 'vs-dark',
    minimap: {
      enabled: false,
    },
  });
  editor.onDidChangeModelContent((e) => {
    emits('update:value', editor!.getValue());
  });
});


</script>

<template>
  <div class="advanced-editor" ref="container">
  </div>
</template>

<style scoped lang="scss">
.advanced-editor {
  height: 200px;
}
</style>
