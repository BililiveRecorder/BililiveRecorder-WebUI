<script setup lang="ts">
import { editor as MonacoEditor } from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { onMounted, ref, onBeforeUnmount } from 'vue';

window.MonacoEnvironment = {
  getWorker(_workerId: any, label: any) {
    switch (label) {
      default:
        return new EditorWorker();
    }
  },
};

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
});
const emits = defineEmits(['update:value']);

const containerRef = ref<HTMLDivElement | null>(null);
let editor: MonacoEditor.IStandaloneCodeEditor | null = null;
const onResize = () => {
  if (editor) {
    editor.layout();
  }
};


onMounted(() => {
  const container = containerRef.value;
  if (container) {
    editor = MonacoEditor.create(container, {
      language: props.language,
      theme: 'vs-dark',
      value: props.value,
      minimap: {
        enabled: false,
      },
    });
    window.addEventListener('resize', onResize);
    editor.onDidChangeModelContent(() => {
      emits('update:value', editor!.getValue());
    });
  }
});
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
  window.removeEventListener('resize', onResize);
});

</script>
<template>
  <div ref="containerRef" class="container"></div>
</template>
<style scoped lang="scss">
.container {
  height: 100%;
}
</style>
