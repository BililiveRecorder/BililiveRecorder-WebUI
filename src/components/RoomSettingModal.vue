<template>
  <n-modal :title="'房间设置 ' + props.roomId" :show="props.show" @update:show="$emit('update:show', $event)" preset="card"
    :style="{ maxWidth: 'min(800px, 100vw)' }">
    <n-space vertical v-if="loading">
      <n-skeleton height="40px" width="33%" />
      <n-skeleton height="40px" round />
      <n-skeleton height="40px" round />
      <n-skeleton height="40px" round />
      <n-skeleton height="40px" round />
      <n-skeleton height="40px" round />
    </n-space>
    <div v-else>
      <div id="auto-record" class="setting-box">
        <n-h3>自动录制</n-h3>
        <optional-input type="boolean" label="自动录制" v-model:value="newRoomConfig['autoRecord']" :hide-default="true" />
      </div>
      <div id="record-mode" class="setting-box">
        <n-h3>录制模式</n-h3>
        <optional-input type="enum" v-model:value="newRoomConfig['optionalRecordMode']" :enums="RecordModes" />
        <n-collapse-transition :show="newRoomConfig['optionalRecordMode']?.value == 0">
          <n-h3>标准模式录制修复设置</n-h3>
          <optional-input type="boolean" label="检测到可能缺少数据时分段"
            v-model:value="newRoomConfig['optionalFlvProcessorSplitOnScriptTag']" :same-as-default="true" />
          <optional-input type="boolean" label="检测到 H264 Annex-B 时禁用修复分段"
            v-model:value="newRoomConfig['optionalFlvProcessorDisableSplitOnH264AnnexB']" :same-as-default="true" />
        </n-collapse-transition>
      </div>
      <div id="auto-split" class="setting-box">
        <n-h3>自动分段</n-h3>
        <optional-input type="enum" v-model:value="newRoomConfig['optionalCuttingMode']" :enums="CuttingModes" />
        <n-collapse-transition :show="newRoomConfig['optionalCuttingMode'].value == 1">
          <optional-input type="number" prefix="每" suffix="保存为一个文件"
            v-model:value="newRoomConfig['optionalCuttingNumber']" unit="分" max-input-width="150px" />
        </n-collapse-transition>
        <n-collapse-transition :show="newRoomConfig['optionalCuttingMode'].value == 2">
          <optional-input type="number" prefix="每" suffix="保存为一个文件"
            v-model:value="newRoomConfig['optionalCuttingNumber']" unit="MiB" max-input-width="150px" />
        </n-collapse-transition>
        <optional-input type="boolean" label="直播间标题修改时切分文件" v-model:value="newRoomConfig['optionalCuttingByTitle']" />
      </div>
      <div id="record-condition" class="setting-box">
        <p>直播间标题过滤 </p>
        <p>跳过录制的直播标题正则匹配表达式，每行一个</p>
        <optional-input type="textarea" v-model:value="newRoomConfig['optionalTitleFilterPatterns']" />
      </div>
      <div id="record-quality" class="setting-box">
        <n-h3>录制画质</n-h3>
        <optional-input style="max-width: 700px;" type="text" v-model:value="newRoomConfig['optionalRecordingQuality']"
          :same-as-default="false" />
      </div>
      <div id="stream-cover" class="setting-box">
        <optional-input type="boolean" label="保存直播封面" v-model:value="newRoomConfig['optionalSaveStreamCover']"
          :same-as-default="false" />
      </div>
      <div id="danmaku-record" class="setting-box">
        <n-h3>弹幕录制</n-h3>
        <optional-input type="boolean" label="保存弹幕" v-model:value="newRoomConfig['optionalRecordDanmaku']" />
        <p>本设置同时是所有“弹幕录制”的总开关，当本设置为 false 时其他所有“弹幕录制”设置无效，不会写入弹幕XML文件。</p>
        <n-collapse-transition :show="newRoomConfig['optionalRecordDanmaku'].value">
          <optional-input type="boolean" label="保存 SuperChat"
            v-model:value="newRoomConfig['optionalRecordDanmakuSuperChat']" />
          <optional-input type="boolean" label="保存 舰长购买" v-model:value="newRoomConfig['optionalRecordDanmakuGuard']" />
          <optional-input type="boolean" label="保存 送礼信息" v-model:value="newRoomConfig['optionalRecordDanmakuGift']" />
          <optional-input type="boolean" label="保存 弹幕原始数据" v-model:value="newRoomConfig['optionalRecordDanmakuRaw']" />
        </n-collapse-transition>
      </div>
    </div>
    <template #action>
      <n-space justify="end">
        <n-button :loading="saving" :disabled="loading" @click="saveConfig">保存</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
<script lang="ts">
import { ref, watch } from 'vue';
import {
  useLoadingBar, useMessage, NCollapseTransition, NH3,
  NSpace, NButton, NModal, NSkeleton,
} from 'naive-ui';
import OptionalInput from './OptionalInput.vue';
import { Recorder, Optional } from '../utils/api';
import { recorderController } from '../utils/RecorderController';

const RecordModes = [{
  label: '标准模式',
  value: 0,
},
{
  label: '原始数据模式',
  value: 1,
}];

const CuttingModes = [{
  label: '不分段',
  value: 0,
},
{
  label: '根据时间切割',
  value: 1,
},
{
  label: '根据文件大小切割',
  value: 2,
}];
</script>
<script lang="ts" setup>

const message = useMessage();
const loadingbar = useLoadingBar();

const loading = ref(true);
const props = defineProps({
  roomId: {
    type: Number,
    required: true,
  },
  objectId: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const emit = defineEmits(['update:show']);

watch(() => props.show, function (newVal, oldValue) {
  if (newVal) {
    initSetting();
  }
});

const newRoomConfig = ref<{ [key: string]: ConfigItem }>({});

interface ConfigItem<T = any> {
  hasValue: boolean,
  value: T,
  defaultValue: T,
}

function close() {
  emit('update:show', false);
}

async function initSetting() {
  loading.value = true;
  newRoomConfig.value = {};
  if (recorderController.recorder == null) {
    return;
  }
  loadingbar.start();
  loading.value = true;
  const loadMessage = message.loading('正在加载配置...', {
    duration: 0,
  });
  let defaultConfig: { [key: string]: Optional<any> } = Recorder.getMockDefaultConfig() as any;
  let globalConfig: { [key: string]: Optional<any> } = Recorder.getMockGlobalConfig() as any;
  let roomConfig: { [key: string]: Optional<any> };
  try {
    defaultConfig = await recorderController.recorder.getDefaultConfig() as any;
  } catch (error: any) {
    message.error(error?.message || error.toString());
    message.error('获取默认配置失败，部分设置可能与实际不符');
  }
  try {
    globalConfig = await recorderController.recorder.getGlobalConfig() as any;
  } catch (error: any) {
    message.error(error?.message || error.toString());
    message.error('获取全局配置失败，部分设置可能与实际不符');
  }
  try {
    roomConfig = await recorderController.recorder.getRoomConfigByObjectId(props.objectId) as any;
    const keys = Object.keys(roomConfig).filter((key) => key !== 'autoRecord');
    const temp: any = {};
    keys.forEach((key) => {
      const rawkey = key.substring(8, 9).toLowerCase() + key.substring(9);
      temp[key] = {
        hasValue: roomConfig[key].hasValue,
        value: roomConfig[key].hasValue ? roomConfig[key].value : (globalConfig[key]?.hasValue ? globalConfig[key].value : defaultConfig[rawkey]),
        defaultValue: (globalConfig[key]?.hasValue ? globalConfig[key].value : defaultConfig[rawkey]),
      };
    });
    temp['autoRecord'] = {
      hasValue: true,
      value: !!roomConfig['autoRecord'],
      defaultValue: true,
    };
    newRoomConfig.value = temp;
    loadMessage.destroy();
    loading.value = false;
    // avoid loadingbar bug
    setTimeout(() => {
      loadingbar.finish();
    }, 0);
  } catch (error: any) {
    console.error(error);
    loadMessage.destroy();
    message.error(error?.message || error.toString());
    message.error('获取房间配置失败，请检查网络');
    loading.value = true;
    loadingbar.error();
    close();
  }
}

const saving = ref(false);

async function saveConfig() {
  if (recorderController.recorder == null) {
    return;
  }
  const msg = message.loading('正在保存配置...', {
    duration: 0,
  });
  loadingbar.start();
  saving.value = true;
  const toSave: any = Object.assign({}, newRoomConfig.value);
  toSave.autoRecord = toSave.autoRecord.value;
  try {
    await recorderController.recorder.setRoomConfigByObjectId(props.objectId, toSave);
    msg.destroy();
    message.success('保存成功');
    loadingbar.finish();
    close();
    saving.value = false;
  } catch (error: any) {
    msg.destroy();
    message.error(error?.message || error.toString());
    message.error('保存失败，请检查网络');
    loadingbar.error();
    saving.value = false;
  }
}
</script>
