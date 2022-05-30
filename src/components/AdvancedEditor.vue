<script setup lang="ts">
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/scroll/simplescrollbars.css';

import { onMounted, ref } from 'vue';

const inputRef = ref<HTMLTextAreaElement | null>(null);

let editor:CodeMirror.Editor | null = null;

defineExpose({
  editor,
});

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:value']);

onMounted(() => {
  console.log(props.value);
  if (inputRef.value == null) return;
  editor = CodeMirror.fromTextArea(inputRef.value, {
    mode: 'javascript',
    lineNumbers: true,
    theme: 'material-darker',
    lineWrapping: true,
    tabSize: 4,
    indentUnit: 4,
    indentWithTabs: false,
    extraKeys: {
      Tab: (cm: CodeMirror.Editor) => {
        const spaces = Array(cm.getOption('indentUnit')||4 + 1).join(' ');
        cm.replaceSelection(spaces);
      },
    },
    scrollbarStyle: 'simple',
  });
  editor.setValue(props.value);
  editor.setSize('100%', '100%');
  editor.on('change', () => {
    emit('update:value', editor!.getValue());
  });
});


</script>

<template>
  <div class="advanced-editor">
    <input ref="inputRef" type="textarea"/>
  </div>
</template>

<style scoped lang="scss">
.advanced-editor{
  height: 100%
}
</style>
