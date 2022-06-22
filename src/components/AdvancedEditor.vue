<script setup lang="ts">
import { editor as MonacoEditor } from 'monaco-editor';
// @ts-ignore
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// @ts-ignore
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
// @ts-ignore
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// @ts-ignore
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { onMounted, ref, onBeforeUnmount } from 'vue';

// TODO: 这declare不行，等待解决
(window as any).MonacoEnvironment = {
  getWorker(_workerId: any, label: any) {
    switch (label) {
      case 'html':
        return new HtmlWorker();
      case 'json':
        return new JsonWorker();
      case 'typescript':
      case 'javascript':
        return new TsWorker();
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
  options: {
    type: Object as () => Map<String, any>,
    default: () => {
      return {};
    },
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
      ...props.options,
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
