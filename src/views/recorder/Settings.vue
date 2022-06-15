<template>
  <div class="flex-row" id="settings-container">
    <div style="flex:1;max-width: 700px;margin: auto;">
      <n-space :justify="'space-between'">
        <n-space :align="'baseline'">
          <n-h2>全局设置</n-h2>
          <span>高级设置</span>
          <n-switch v-model:value="showAdvanced"></n-switch>
        </n-space>
        <n-button @click="saveConfig">保存</n-button>
      </n-space>
      <div id="danmaku-record" class="setting-box">
        <n-h3>弹幕录制</n-h3>
        <optional-input type="boolean" label="保存弹幕" v-model:value="newConfig['optionalRecordDanmaku']"
          :same-as-default="true" />
        <p>本设置同时是所有“弹幕录制”的总开关，当本设置为 false 时其他所有“弹幕录制”设置无效，不会写入弹幕XML文件。</p>
        <n-collapse-transition :show="newConfig['optionalRecordDanmaku']?.value || false">
          <optional-input type="boolean" label="保存 SuperChat"
            v-model:value="newConfig['optionalRecordDanmakuSuperChat']" :same-as-default="true" />
          <optional-input type="boolean" label="保存 舰长购买" v-model:value="newConfig['optionalRecordDanmakuGuard']"
            :same-as-default="true" />
          <optional-input type="boolean" label="保存 送礼信息" v-model:value="newConfig['optionalRecordDanmakuGift']"
            :same-as-default="true" />
          <optional-input type="boolean" label="保存 弹幕原始数据" v-model:value="newConfig['optionalRecordDanmakuRaw']"
            :same-as-default="true" />
          <n-collapse-transition :show="showAdvanced">
            <optional-input type="number" label="触发写硬盘所需的弹幕数量"
              v-model:value="newConfig['optionalRecordDanmakuFlushInterval']" :same-as-default="true" unit="个"
              max-input-width="150px" />
          </n-collapse-transition>
        </n-collapse-transition>
      </div>
      <div id="record-mode" class="setting-box">
        <n-h3>录制模式</n-h3>
        <optional-input type="enum" v-model:value="newConfig['optionalRecordMode']" :enums="RecordModes"
          :same-as-default="true" />
      </div>
      <div id="auto-split" class="setting-box">
        <n-h3>自动分段</n-h3>
        <optional-input type="enum" v-model:value="newConfig['optionalCuttingMode']" :enums="CuttingModes"
          :same-as-default="true" />
        <n-collapse-transition :show="newConfig['optionalCuttingMode']?.value == 1">
          <optional-input type="number" prefix="每" suffix="保存为一个文件" v-model:value="newConfig['optionalCuttingNumber']"
            :same-as-default="true" unit="分" max-input-width="150px" />
        </n-collapse-transition>
        <n-collapse-transition :show="newConfig['optionalCuttingMode']?.value == 2">
          <optional-input type="number" prefix="每" suffix="保存为一个文件" v-model:value="newConfig['optionalCuttingNumber']"
            :same-as-default="true" unit="MiB" max-input-width="150px" />
        </n-collapse-transition>
      </div>
      <div id="filename" class="setting-box">
        <n-h3>文件名</n-h3>
        <optional-input style="max-width: 700px;" type="text"
          v-model:value="newConfig['optionalFileNameRecordTemplate']" :same-as-default="false" />
        <n-button @click="toggleFileNamePreviewModal">预览</n-button>
      </div>
      <div id="record-quality" class="setting-box">
        <n-h3>录制画质</n-h3>
        <optional-input style="max-width: 700px;" type="text" v-model:value="newConfig['optionalRecordingQuality']"
          :same-as-default="false" />
      </div>
      <div id="webhook" class="setting-box">
        <n-h3>Webhook</n-h3>
        <p>
          每行一个，详情参阅
          <n-a href="https://rec.danmuji.org/docs/basic/webhook/">文档</n-a>
        </p>
        <p>Webhook V1</p>
        <optional-input type="textarea" :max-input-width="'700px'" v-model:value="newConfig['optionalWebHookUrls']"
          :same-as-default="true" />
        <p>Webhook V2</p>
        <optional-input type="textarea" :max-input-width="'700px'" v-model:value="newConfig['optionalWebHookUrlsV2']"
          :same-as-default="true" />
      </div>
      <n-collapse-transition :show="showAdvanced">
        <div id="live-api-host">
          <n-h3>请求的 API Host</n-h3>
          <optional-input style="max-width: 700px;" type="text" v-model:value="newConfig['optionalLiveApiHost']"
            :same-as-default="false" />
        </div>
        <div id="cookie" class="setting-box">
          <n-h3>Cookie</n-h3>
          <optional-input type="text" :max-input-width="'700px'" v-model:value="newConfig['optionalCookie']"
            :same-as-default="true" />
        </div>
        <div id="timing" class="setting-box">
          <n-h3>时间间隔</n-h3>
          <optional-input style="max-width: 700px;" type="number" label="HTTP API 检查时间间隔"
            v-model:value="newConfig['optionalTimingCheckInterval']" unit="秒" max-input-width="150px" />
          <optional-input style="max-width: 700px;" type="number" label="录制断开重连时间间隔"
            v-model:value="newConfig['optionalTimingStreamRetry']" unit="毫秒" max-input-width="150px" />
          <optional-input style="max-width: 700px;" type="number" label="录制无指定画质重连时间间隔"
            v-model:value="newConfig['optionalTimingStreamRetryNoQn']" unit="秒" max-input-width="150px" />
          <optional-input style="max-width: 700px;" type="number" label="连接直播服务器超时时间"
            v-model:value="newConfig['optionalTimingStreamConnect']" unit="毫秒" max-input-width="150px" />
          <optional-input style="max-width: 700px;" type="number" label="弹幕服务器重连时间间隔"
            v-model:value="newConfig['optionalTimingDanmakuRetry']" unit="毫秒" max-input-width="150px" />
          <optional-input style="max-width: 700px;" type="number" label="最大允许未收到直播数据时间"
            v-model:value="newConfig['optionalTimingWatchdogTimeout']" unit="毫秒" max-input-width="150px" />
        </div>
        <div id="network" class="setting-box">
          <n-h3>网络设置</n-h3>
          <optional-input type="boolean" label="使用系统代理"
            v-model:value="newConfig['optionalNetworkTransportUseSystemProxy']" :same-as-default="true" />
          <optional-input type="enum" label="允许使用的网络类型"
            v-model:value="newConfig['optionalNetworkTransportAllowedAddressFamily']" :enums="IPFamilies"
            :same-as-default="true" />
        </div>
        <div id="userscript" class="setting-box">
          <n-space :justify="'space-between'">
            <n-h3>用户脚本</n-h3>
            <n-button v-if="!useAdvancedEditor" size="small" @click="UseAdvancedEditor">加载高级编辑器</n-button>
          </n-space>
          <optional-input v-if="!useAdvancedEditor" type="textarea" :max-input-width="'700px'"
            v-model:value="newConfig['optionalUserScript']" :same-as-default="true" />
          <advanced-editor v-else v-model:value="newConfig['optionalUserScript'].value" style="height: 300px;" />
        </div>
      </n-collapse-transition>
    </div>
    <div class="anchor">
      <n-anchor affix :show-rail="false" listen-to=".n-scrollbar-container" offset-target=".n-scrollbar-container"
        ignore-gap :trigger-top="12" :top="88" z-index="1">
        <n-anchor-link title="弹幕录制" href="#danmaku-record" />
        <n-anchor-link title="录制模式" href="#record-mode" />
        <n-anchor-link title="自动分段" href="#auto-split" />
        <n-anchor-link title="文件名" href="#filename" />
        <n-anchor-link title="录制画质" href="#record-quality" />
        <n-anchor-link title="Webhook" href="#webhook" />
        <n-anchor-link v-if="showAdvanced" title="请求的 API Host" href="#live-api-host" />
        <n-anchor-link v-if="showAdvanced" title="Cookie" href="#cookie" />
        <n-anchor-link v-if="showAdvanced" title="时间间隔" href="#timing" />
        <n-anchor-link v-if="showAdvanced" title="网络设置" href="#network" />
        <n-anchor-link v-if="showAdvanced" title="用户脚本" href="#userscript" />
      </n-anchor>
    </div>
    <file-name-preview-modal v-model:show="showFileNamePreviewModal"
      :defaultTemplate="newConfig['optionalFileNameRecordTemplate'].hasValue ? newConfig['optionalFileNameRecordTemplate'].value : newConfig['optionalFileNameRecordTemplate'].defaultValue"
      @close="handleFileNamePreviewModalClose" />
  </div>
</template>

<script setup lang="ts">
import { NH2, NH3, NCollapseTransition, NAnchor, NAnchorLink, NSpace, NSwitch, NA, NButton, useLoadingBar, useMessage } from 'naive-ui';
import { onMounted, ref, defineAsyncComponent } from 'vue';
import { Recorder, Optional } from '../../utils/api';
import OptionalInput from '../../components/OptionalInput.vue';
import { recorderController } from '../../utils/RecorderController';
import FileNamePreviewModal from '../../components/FileNamePreviewModal.vue';

const AdvancedEditor = defineAsyncComponent(() => {
  return import('../../components/AdvancedEditor.vue');
});

const loadingbar = useLoadingBar();
const message = useMessage();

const defaultConfig = ref<{ [key: string]: any }>(Recorder.getMockDefaultConfig());

interface ConfigItem<T = any> {
  hasValue: boolean,
  value: T,
  defaultValue: T,
}
function getEmptyConfigItem(defaultValue: any): ConfigItem {
  return {
    hasValue: false,
    value: defaultValue,
    defaultValue: defaultValue,
  };
}

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

const IPFamilies = [
  {
    label: '系统(禁用录播姬的IP随机选择)',
    value: -1,
  },
  {
    label: '任意',
    value: 0,
  },
  {
    label: '仅IPv4',
    value: 1,
  },
  {
    label: '仅IPv6',
    value: 2,
  }];

const newConfig = ref<{ [key: string]: ConfigItem }>({
  'optionalRecordDanmaku': getEmptyConfigItem(defaultConfig.value.recordDanmaku),
  'optionalRecordMode': getEmptyConfigItem(defaultConfig.value.recordMode),
  'optionalRecordDanmakuRaw': getEmptyConfigItem(defaultConfig.value.recordDanmakuRaw),
  'optionalRecordDanmakuSuperChat': getEmptyConfigItem(defaultConfig.value.recordDanmakuSuperChat),
  'optionalRecordDanmakuGift': getEmptyConfigItem(defaultConfig.value.recordDanmakuGift),
  'optionalRecordDanmakuGuard': getEmptyConfigItem(defaultConfig.value.recordDanmakuGuard),
  'optionalRecordDanmakuFlushInterval': getEmptyConfigItem(defaultConfig.value.recordDanmakuFlushInterval),
  'optionalCuttingMode': getEmptyConfigItem(defaultConfig.value.cuttingMode),
  'optionalFileNameRecordTemplate': getEmptyConfigItem(defaultConfig.value.fileNameRecordTemplate),
  'optionalRecordingQuality': getEmptyConfigItem(defaultConfig.value.recordingQuality),
  'optionalCuttingNumber': getEmptyConfigItem(defaultConfig.value.cuttingNumber),
  'optionalLiveApiHost': getEmptyConfigItem(defaultConfig.value.liveApiHost),
  'optionalCookie': getEmptyConfigItem(defaultConfig.value.cookie),
  'optionalWebHookUrls': getEmptyConfigItem(defaultConfig.value.webHookUrls),
  'optionalWebHookUrlsV2': getEmptyConfigItem(defaultConfig.value.webHookUrlsV2),
  'optionalTimingCheckInterval': getEmptyConfigItem(defaultConfig.value.timingCheckInterval),
  'optionalTimingStreamRetry': getEmptyConfigItem(defaultConfig.value.timingStreamRetry),
  'optionalTimingStreamRetryNoQn': getEmptyConfigItem(defaultConfig.value.timingStreamRetryNoQn),
  'optionalTimingStreamConnect': getEmptyConfigItem(defaultConfig.value.timingStreamConnect),
  'optionalTimingDanmakuRetry': getEmptyConfigItem(defaultConfig.value.timingDanmakuRetry),
  'optionalTimingWatchdogTimeout': getEmptyConfigItem(defaultConfig.value.timingWatchdogTimeout),
  'optionalNetworkTransportUseSystemProxy': getEmptyConfigItem(defaultConfig.value.networkTransportUseSystemProxy),
  'optionalNetworkTransportAllowedAddressFamily': getEmptyConfigItem(defaultConfig.value.networkTransportAllowedAddressFamily),
  'optionalUserScript': getEmptyConfigItem(defaultConfig.value.userScript),
});

let lastload: string | undefined = '';

async function init(): Promise<void> {
  loadingbar.start();
  if (recorderController.recorder == null) {
    loadingbar.error();
    message.error('未连接录播姬');
    return;
  }
  const loadMessage = message.loading('正在加载配置...', {
    duration: 0,
  });
  if (lastload != recorderController.recorder.meta.id) {
    const host = recorderController.recorder.meta.id;
    try {
      defaultConfig.value = await recorderController.recorder.getDefaultConfig();
      lastload = host;
    } catch (error: any) {
      message.error(error?.message || error.toString(), {
        keepAliveOnHover: true,
      });
      message.error(`加载默认配置失败，可能部分设置项默认值与服务器不一致，请注意。`);
      console.error(error);
    }
  }
  try {
    const globalConfig = (await recorderController.recorder.getGlobalConfig()) as unknown as { [key: string]: Optional<any> };
    const keys = Object.keys(globalConfig);
    const temp: any = {};
    keys.forEach((key) => {
      const rawkey = key.substring(8, 9).toLowerCase() + key.substring(9);
      temp[key] = {
        hasValue: globalConfig[key].hasValue,
        value: globalConfig[key].hasValue ? globalConfig[key].value : defaultConfig.value[rawkey],
        defaultValue: defaultConfig.value[rawkey],
      };
    });
    newConfig.value = temp;
    // avoid loadingbar bug
    setTimeout(() => {
      loadingbar.finish();
    }, 0);
    loadMessage.destroy();
  } catch (error: any) {
    loadMessage.destroy();
    message.error('加载设置时出错：' + (error?.message || error.toString()), {
      keepAliveOnHover: true,
    });
    loadingbar.error();
    console.error(error);
  }
}

async function saveConfig() {
  loadingbar.start();
  if (recorderController.recorder == null) {
    loadingbar.error();
    message.error('未连接录播姬');
    return;
  }
  const loadMessage = message.loading('正在保存配置...', {
    duration: 0,
  });
  try {
    const globalConfig = (await recorderController.recorder.setGlobalConfig(newConfig.value)) as unknown as { [key: string]: Optional<any> };
    const keys = Object.keys(globalConfig);
    const temp: any = {};
    keys.forEach((key) => {
      const rawkey = key.substring(8, 9).toLowerCase() + key.substring(9);
      temp[key] = {
        hasValue: globalConfig[key].hasValue,
        value: globalConfig[key].hasValue ? globalConfig[key].value : defaultConfig.value[rawkey],
        defaultValue: defaultConfig.value[rawkey],
      };
    });
    newConfig.value = temp;
    loadingbar.finish();
    loadMessage.destroy();
    message.success('保存成功');
  } catch (error: any) {
    loadMessage.destroy();
    message.error('保存设置时出错：' + (error?.message || error.toString()), {
      keepAliveOnHover: true,
    });

    loadingbar.error();
    console.error(error);
  }
}

onMounted(() => {
  init();
});

// 编辑器
const showAdvanced = ref(false);

const useAdvancedEditor = ref(false);

function UseAdvancedEditor() {
  useAdvancedEditor.value = true;
  newConfig.value['optionalUserScript'].hasValue = true;
}

// 文件名预览

const showFileNamePreviewModal = ref(false);

function toggleFileNamePreviewModal() {
  showFileNamePreviewModal.value = !showFileNamePreviewModal.value;
}
function handleFileNamePreviewModalClose(newTemplate: string) {
  console.log(newTemplate);
  newConfig.value['optionalFileNameRecordTemplate'].value = newTemplate;
  newConfig.value['optionalFileNameRecordTemplate'].hasValue = true;
}

</script>
<style scoped lang="sass">

.flex-row
  display: flex
  flex-direction: row
.setting-box
  margin-bottom: 24px
.anchor
  min-width: 9em
  display: none
$breakpoint-tablet: 768px
@media (min-width: $breakpoint-tablet)
  .anchor
    display: block
</style>
