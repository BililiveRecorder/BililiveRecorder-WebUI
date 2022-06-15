<script setup lang="ts">
import { ref } from 'vue';
import { NModal, NSpace, NInput, NInputNumber, NForm, NFormItem, NButton, NText } from 'naive-ui';
import type { FileNameTemplateContextDto } from '../utils/api';
import { debounce } from 'lodash-es';
import { recorderController } from '../utils/RecorderController';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  defaultTemplate: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['update:show', 'close']);

const template = ref('');
const context = ref<FileNameTemplateContextDto>({
  roomId: 912226,
  shortId: 0,
  name: 'shugen',
  title: '废物还不干活',
  areaParent: '虚拟主播',
  areaChild: '虚拟主播',
  qn: 10000,
  json: '{}',
});
const result = ref('');
const hasError = ref(false);

function onClose() {
  emits('update:show', false);
}

function saveAndClose() {
  emits('update:show', false);
  emits('close', { value: template });
}

function test() {
  recorderController.recorder?.generateFileName(template.value, context.value).then((e) => {
    result.value = e;
    hasError.value = false;
  }).catch((e) => {
    result.value = e.message;
    hasError.value = true;
  });
}

const debounceTest = debounce(test, 500);

function syncTemplate() {
  template.value = props.defaultTemplate;
  debounceTest();
}
</script>
<template>
  <n-modal preset="card" :show="props.show" :on-update:show="(e) => emits('update:show', e)"
    :style="{ maxWidth: '600px' }" title="预览输出文件名" @after-enter="syncTemplate">
    <div>
      <div>
        <h3>文件名模板：</h3>
        <n-input v-model:value="template" @input="debounceTest" />
      </div>
      <n-text tag="p" :type="hasError ? 'error' : 'info'">{{ hasError ? ("错误： " + result) : ("将会保存为：" + result) }}
      </n-text>
      <div>
        <h3>模拟数据：</h3>
        <n-form label-placement="left" label-width="auto">
          <n-form-item label="房间号">
            <n-input-number v-model:value="context.roomId" @input="debounceTest" @change="debounceTest" />
          </n-form-item>
          <n-form-item label="短位房间号">
            <n-input-number v-model:value="context.shortId" @input="debounceTest" @change="debounceTest" />
          </n-form-item>
          <n-form-item label="用户名">
            <n-input v-model:value="context.name" @input="debounceTest" />
          </n-form-item>
          <n-form-item label="直播标题">
            <n-input v-model:value="context.title" @input="debounceTest" />
          </n-form-item>
          <n-form-item label="分区">
            <n-space>
              <n-input v-model:value="context.areaParent" @input="debounceTest" />
              <n-input v-model:value="context.areaChild" @input="debounceTest" />
            </n-space>
          </n-form-item>
          <n-form-item label="画质">
            <n-input-number v-model:value="context.qn" @input="debounceTest" />
          </n-form-item>
          <n-form-item label="JSON">
            <n-input v-model:value="context.json" @input="debounceTest" />
          </n-form-item>
        </n-form>
      </div>
    </div>
    <template #action>
      <n-space justify="end">
        <n-button @click="onClose">关闭</n-button>
        <n-button type="primary" @click="saveAndClose">使用</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
