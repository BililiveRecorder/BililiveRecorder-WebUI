<script lang="ts">
import { computed, ref } from 'vue';
import { NModal, NSpace, NInput, NInputNumber, NForm, NFormItem, NButton, NText } from 'naive-ui';
import type { FileNameTemplateContextDto } from '../utils/api';
import { debounce } from 'lodash-es';
import { recorderController } from '../utils/RecorderController';

</script>
<script setup lang="ts">

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
  partIndex: 1,
  qn: 10000,
  json: '{}',
});
const result = ref('');
const errorMessage = ref('');

function onClose() {
  emits('update:show', false);
}

function saveAndClose() {
  emits('update:show', false);
  emits('close', template.value);
}

function test() {
  recorderController.recorder?.generateFileName(template.value, context.value).then((e) => {
    result.value = e.relativePath;
    errorMessage.value = e.errorMessage;
  }).catch((e) => {
    result.value = '';
    errorMessage.value = e.message || e.toString();
  });
}

const debounceTest = debounce(test, 500);

function syncTemplate() {
  template.value = props.defaultTemplate;
  debounceTest();
}

function jsonVerify(value: string) {
  try {
    JSON.parse(value);
    return 'success';
  } catch (e) {
    return 'error';
  }
}
const jsonVerifyStatus = computed(() => {
  return jsonVerify(context.value.json);
});
</script>
<template>
  <n-modal preset="card" :show="props.show" :on-update:show="(e: any) => emits('update:show', e)"
    :style="{ maxWidth: '600px' }" title="预览输出文件名" @after-enter="syncTemplate">
    <div>
      <div>
        <h3>文件名模板：</h3>
        <n-input v-model:value="template" @input="debounceTest" />
      </div>
      <n-text tag="p" v-if="errorMessage" :type="'error'">错误：{{ errorMessage }}</n-text>
      <n-text tag="p" v-if="result" :type="'info'">将会保存到：工作目录/{{ result }}</n-text>
      <div>
        <h3>模拟数据：</h3>
        <n-form label-placement="left" label-width="auto">
          <n-form-item label="房间号">
            <n-input-number v-model:value="context.roomId" @input="debounceTest" :show-button="false" />
          </n-form-item>
          <n-form-item label="短位房间号">
            <n-input-number v-model:value="context.shortId" @input="debounceTest" :show-button="false" />
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
          <n-form-item label="片段序号">
            <n-input-number v-model:value="context.partIndex" @input="debounceTest" :show-button="false" />
          </n-form-item>
          <n-form-item label="画质">
            <n-input-number v-model:value="context.qn" @input="debounceTest" :show-button="false" />
          </n-form-item>
          <n-form-item label="JSON" :validation-status="jsonVerifyStatus">
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
