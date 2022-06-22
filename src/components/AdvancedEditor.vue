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
import { NButton } from 'naive-ui';

window.MonacoEnvironment = {
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
  fullscreen: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Object as () => Map<String, any>,
    default: () => {
      return {};
    },
  },
});
const emits = defineEmits(['update:value']);

const isFullscreen = ref(false);
const containerRef = ref<HTMLDivElement | null>(null);
let editor: MonacoEditor.IStandaloneCodeEditor | null = null;


const onResize = () => {
  if (editor) {
    editor.layout();
  }
};

const toggleFullscreen = () => {
  if (editor) {
    isFullscreen.value = !isFullscreen.value;
    setTimeout(() => {
      if (editor) {
        editor.layout();
      }
    }, 0);
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
    if (props.fullscreen) {
      editor.addAction({
        id: 'fullscreen',
        label: '切换网页全屏',
        run: (editor: MonacoEditor.IStandaloneCodeEditor) => {
          toggleFullscreen();
        },
      });
    }
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
  <teleport to="body" :disabled="!isFullscreen">
    <div class="container" :class="{ 'fullscreen': isFullscreen }">
      <div class="editor" ref="containerRef"></div>
      <div v-if="props.fullscreen" class="actions">
        <n-button @click="toggleFullscreen">切换网页全屏</n-button>
      </div>
    </div>
  </teleport>
</template>
<style scoped lang="scss">
.container {
  height: 100%;

  .editor {
    height: 100%;
    width: 100%;
    min-height: 200px;
  }

  .actions {
    position: relative;
    bottom: 3em;
    float: right;
    right: 2em;
  }

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }
}
</style>
