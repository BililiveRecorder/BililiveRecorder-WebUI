<template>
  <div class="settings-container">
    <div class="settings-container-internal">
      <n-space :justify="'space-between'">
        <n-space :align="'baseline'">
          <n-h2>全局设置</n-h2>
          <span>高级设置</span>
          <n-switch v-model:value="showAdvanced"></n-switch>
        </n-space>
      </n-space>
      <n-collapse-transition :show="showAdvanced">
        <n-alert type="info" style="margin-bottom: 1em;" title="提示">
          所有高级设置项目均不是录播姬的“正式功能”，它们的作用是便于 power users 在不修改录播姬源码重新编译的情况下深度调整录播姬的行为。
          请根据个人实际需求谨慎使用高级设置，不要随意修改。
        </n-alert>
      </n-collapse-transition>
      <div id="danmaku-record" class="setting-box">
        <n-h3>弹幕录制</n-h3>
        <optional-input type="boolean" label="保存弹幕" v-model:value="newConfig['optionalRecordDanmaku']"
          :same-as-default="true" @changed="onChanged" />
        <p>本设置同时是所有“弹幕录制”的总开关，当本设置为 false 时其他所有“弹幕录制”设置无效，不会写入弹幕XML文件。</p>
        <n-collapse-transition :show="newConfig['optionalRecordDanmaku']?.value || false">
          <optional-input type="boolean" label="保存 SuperChat"
            v-model:value="newConfig['optionalRecordDanmakuSuperChat']" :same-as-default="true" @changed="onChanged" />
          <optional-input type="boolean" label="保存 舰长购买" v-model:value="newConfig['optionalRecordDanmakuGuard']"
            :same-as-default="true" @changed="onChanged" />
          <optional-input type="boolean" label="保存 送礼信息" v-model:value="newConfig['optionalRecordDanmakuGift']"
            :same-as-default="true" @changed="onChanged" />
          <optional-input type="boolean" label="保存 弹幕原始数据" v-model:value="newConfig['optionalRecordDanmakuRaw']"
            :same-as-default="true" @changed="onChanged" />
          <n-collapse-transition :show="showAdvanced">
            <optional-input type="number" label="触发写硬盘所需的弹幕数量"
              v-model:value="newConfig['optionalRecordDanmakuFlushInterval']" :same-as-default="true" unit="个"
              max-input-width="150px" @changed="onChanged" />
          </n-collapse-transition>
        </n-collapse-transition>
      </div>
      <div id="record-mode" class="setting-box">
        <n-h3>录制模式</n-h3>
        <optional-input type="enum" v-model:value="newConfig['optionalRecordMode']" :enums="RecordModes"
          :same-as-default="true" @changed="onChanged" />
        <n-collapse-transition :show="newConfig['optionalRecordMode']?.value == 0">
          <n-h3>标准模式录制修复设置</n-h3>
          <optional-input type="boolean" label="检测到可能缺少数据时分段"
            v-model:value="newConfig['optionalFlvProcessorSplitOnScriptTag']" :same-as-default="true"
            @changed="onChanged" />
          <optional-input type="boolean" label="检测到 H264 Annex-B 时禁用修复分段"
            v-model:value="newConfig['optionalFlvProcessorDisableSplitOnH264AnnexB']" :same-as-default="true"
            @changed="onChanged" />
        </n-collapse-transition>
      </div>
      <div id="auto-split" class="setting-box">
        <n-h3>自动分段</n-h3>
        <optional-input type="enum" label="分段模式" v-model:value="newConfig['optionalCuttingMode']" :enums="CuttingModes"
          :same-as-default="true" @changed="onChanged" />
        <n-collapse-transition :show="newConfig['optionalCuttingMode']?.value == 1">
          <optional-input type="number" prefix="每" suffix="保存为一个文件" v-model:value="newConfig['optionalCuttingNumber']"
            :same-as-default="true" unit="分" max-input-width="150px" @changed="onChanged" />
        </n-collapse-transition>
        <n-collapse-transition :show="newConfig['optionalCuttingMode']?.value == 2">
          <optional-input type="number" prefix="每" suffix="保存为一个文件" v-model:value="newConfig['optionalCuttingNumber']"
            :same-as-default="true" unit="MiB" max-input-width="150px" @changed="onChanged" />
        </n-collapse-transition>
        <optional-input type="boolean" label="直播间标题修改时切分文件" v-model:value="newConfig['optionalCuttingByTitle']"
          :same-as-default="true" @changed="onChanged" />
      </div>
      <div id="record-condition" class="setting-box">
        <n-h3>录制条件</n-h3>
        <p>直播间标题过滤 </p>
        <p>跳过录制的直播标题正则匹配表达式，每行一个</p>
        <optional-input type="textarea" v-model:value="newConfig['optionalTitleFilterPatterns']" :same-as-default="true"
          @changed="onChanged" />
      </div>
      <div id="storage" class="setting-box">
        <n-h3>文件写入</n-h3>
        <optional-input style="max-width: 700px;" label="文件名" type="text"
          v-model:value="newConfig['optionalFileNameRecordTemplate']" :same-as-default="false" @changed="onChanged" />
        <n-button @click="toggleFileNamePreviewModal">预览文件名</n-button>
        <optional-input type="boolean" label="保存直播封面" v-model:value="newConfig['optionalSaveStreamCover']"
          :same-as-default="true" @changed="onChanged" />
        <optional-input type="boolean" label="在flv中写入直播信息" v-model:value="newConfig['optionalFlvWriteMetadata']"
          :same-as-default="true" @changed="onChanged" />
      </div>
      <div id="record-quality" class="setting-box">
        <n-h3>录制画质</n-h3>
        <optional-input style="max-width: 700px;" type="text" v-model:value="newConfig['optionalRecordingQuality']"
          :same-as-default="false" @changed="onChanged" />
      </div>
      <div id="webhook" class="setting-box">
        <n-h3>Webhook</n-h3>
        <p>
          每行一个，详情参阅
          <n-a href="https://rec.danmuji.org/reference/webhook/">文档</n-a>
        </p>
        <p>Webhook V1</p>
        <optional-input type="textarea" :max-input-width="'700px'" v-model:value="newConfig['optionalWebHookUrls']"
          :same-as-default="true" @changed="onChanged" />
        <p>Webhook V2</p>
        <optional-input type="textarea" :max-input-width="'700px'" v-model:value="newConfig['optionalWebHookUrlsV2']"
          :same-as-default="true" @changed="onChanged" />
      </div>
      <n-collapse-transition :show="showAdvanced">
        <div id="live-api-host">
          <n-h3>请求的 API Host</n-h3>
          <optional-input style="max-width: 700px;" type="text" v-model:value="newConfig['optionalLiveApiHost']"
            :same-as-default="false" @changed="onChanged" />
        </div>
        <div id="cookie" class="setting-box">
          <n-h3>Cookie</n-h3>
          <n-alert type="warning" title="警告">
            <p>Cookie 会用于包括获取直播间信息、获取直播流地址、连接弹幕服务器在内的所有 API 请求中。录播姬的请求与浏览器内正常使用所发送的请求不完全一致，能通过分析请求日志识别出来。</p>
            <p>软件开发者不对账号发生的任何事情负责，包括并不限于<b>被标记为机器人账号、大会员被冻结、无法参与各种抽奖和活动等</b>。<b style="color:red">建议使用小号。</b></p>
            <p>如您知晓您的账号会因以上所列出来的部分原因所导致无法使用或权益受损等情况，并愿意承担由此所会带来的一系列后果，请继续以下的操作，软件开发者不会对您账号所发生的任何后果承担责任。 </p>
          </n-alert>
          <optional-input type="text" :max-input-width="'700px'" v-model:value="newConfig['optionalCookie']"
            :same-as-default="true" @changed="onChanged" />
        </div>
        <div id="network" class="setting-box">
          <n-h3>网络设置</n-h3>
          <optional-input type="boolean" label="使用系统代理"
            v-model:value="newConfig['optionalNetworkTransportUseSystemProxy']" :same-as-default="true"
            @changed="onChanged" />
          <optional-input type="enum" label="允许使用的网络类型"
            v-model:value="newConfig['optionalNetworkTransportAllowedAddressFamily']" :enums="IPFamilies"
            :same-as-default="true" @changed="onChanged" />
          <optional-input type="enum" label="弹幕链接协议" v-model:value="newConfig['optionalDanmakuTransport']"
            :enums="DanmakuTransport" :same-as-default="true" @changed="onChanged" />
          <optional-input type="boolean" label="使用直播间主播的uid进行弹幕服务器认证"
            v-model:value="newConfig['optionalDanmakuAuthenticateWithStreamerUid']" :same-as-default="true"
            @changed="onChanged" />
        </div>
        <div id="timing" class="setting-box">
          <n-h3>时间间隔</n-h3>
          <optional-input style="max-width: 700px;" type="number" label="HTTP API 检查时间间隔"
            v-model:value="newConfig['optionalTimingCheckInterval']" unit="秒" max-input-width="150px"
            @changed="onChanged" />
          <optional-input style="max-width: 700px;" type="number" label="API请求超时时间"
            v-model:value="newConfig['optionalTimingApiTimeout']" unit="毫秒" max-input-width="150px"
            @changed="onChanged" />
          <optional-input style="max-width: 700px;" type="number" label="录制断开重连时间间隔"
            v-model:value="newConfig['optionalTimingStreamRetry']" unit="毫秒" max-input-width="150px"
            @changed="onChanged" />
          <optional-input style="max-width: 700px;" type="number" label="录制无指定画质重连时间间隔"
            v-model:value="newConfig['optionalTimingStreamRetryNoQn']" unit="秒" max-input-width="150px"
            @changed="onChanged" />
          <optional-input style="max-width: 700px;" type="number" label="最大允许未收到直播数据时间"
            v-model:value="newConfig['optionalTimingWatchdogTimeout']" unit="毫秒" max-input-width="150px"
            @changed="onChanged" />
          <optional-input style="max-width: 700px;" type="number" label="连接直播服务器超时时间"
            v-model:value="newConfig['optionalTimingStreamConnect']" unit="毫秒" max-input-width="150px"
            @changed="onChanged" />
          <optional-input style="max-width: 700px;" type="number" label="弹幕服务器重连时间间隔"
            v-model:value="newConfig['optionalTimingDanmakuRetry']" unit="毫秒" max-input-width="150px"
            @changed="onChanged" />
        </div>
        <div id="userscript" class="setting-box">
          <n-h3>用户脚本</n-h3>
          <optional-input type="textarea" :max-input-width="'700px'" v-model:value="newConfig['optionalUserScript']"
            :same-as-default="true" @changed="onChanged" />
        </div>
      </n-collapse-transition>
      <n-affix v-if="isChanged" :bottom="32" :trigger-bottom="128" :listen-to="() => containerRef"
        style="max-width: 700px; width: calc(100% - 80px);">
        <n-card size="small">
          <div style="margin:4px 0;font-size: 1.125em; display: inline-block;">注意！你尚未保存修改！</div><n-button
            @click="saveConfig" type="primary" style="float: right;">保存</n-button>
        </n-card>
      </n-affix>
    </div>
    <div class="anchor">
      <n-anchor :show-rail="false" offset-target="#app-layout" position="fix" ignore-gap z-index="1" type="block"
        :internalScrollable="false" style="position:sticky; top:64px;">
        <n-anchor-link title="弹幕录制" href="#danmaku-record" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link title="录制模式" href="#record-mode" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link title="自动分段" href="#auto-split" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link title="录制条件" href="#record-condition" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link title="文件写入" href="#storage" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link title="录制画质" href="#record-quality" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link title="Webhook" href="#webhook" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link v-if="showAdvanced" title="请求的 API Host" href="#live-api-host"
          @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link v-if="showAdvanced" title="Cookie" href="#cookie" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link v-if="showAdvanced" title="网络设置" href="#network" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link v-if="showAdvanced" title="时间间隔" href="#timing" @click="(e: any) => { e.preventDefault() }" />
        <n-anchor-link v-if="showAdvanced" title="用户脚本" href="#userscript"
          @click="(e: any) => { e.preventDefault() }" />
      </n-anchor>
    </div>
    <file-name-preview-modal v-model:show="showFileNamePreviewModal"
      :defaultTemplate="newConfig['optionalFileNameRecordTemplate'].hasValue ? newConfig['optionalFileNameRecordTemplate'].value : newConfig['optionalFileNameRecordTemplate'].defaultValue"
      @close="handleFileNamePreviewModalClose" />
  </div>
</template>

<script setup lang="ts">
import { NH2, NH3, NCollapseTransition, NAnchor, NAnchorLink, NSpace, NSwitch, NA, NAlert, NButton, NAffix, NCard, useLoadingBar, useMessage } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { Recorder, Optional } from '../../utils/api';
import OptionalInput from '../../components/OptionalInput.vue';
import { recorderController } from '../../utils/RecorderController';
import FileNamePreviewModal from '../../components/FileNamePreviewModal.vue';


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

const RecordModes = [
  {
    label: '标准模式',
    value: 0,
  },
  {
    label: '原始数据模式',
    value: 1,
  },
];

const CuttingModes = [
  {
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
  },
];

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
  },
];

const DanmakuTransport = [
  {
    label: '随机',
    value: 0,
  },
  {
    label: 'TCP',
    value: 1,
  },
  {
    label: 'WS',
    value: 2,
  },
  {
    label: 'WSS',
    value: 3,
  },
];

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
  'optionalFlvProcessorSplitOnScriptTag': getEmptyConfigItem(defaultConfig.value.flvProcessorSplitOnScriptTag),
  'optionalFlvProcessorDisableSplitOnH264AnnexB': getEmptyConfigItem(defaultConfig.value.flvProcessorDisableSplitOnH264AnnexB),
  'optionalRecordingQuality': getEmptyConfigItem(defaultConfig.value.recordingQuality),
  'optionalCuttingNumber': getEmptyConfigItem(defaultConfig.value.cuttingNumber),
  'optionalCuttingByTitle': getEmptyConfigItem(defaultConfig.value.cuttingByTitle),
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
  'optionalDanmakuTransport': getEmptyConfigItem(defaultConfig.value.danmakuTransport),
  'optionalDanmakuAuthenticateWithStreamerUid': getEmptyConfigItem(defaultConfig.value.danmakuAuthenticateWithStreamerUid),
  'optionalNetworkTransportUseSystemProxy': getEmptyConfigItem(defaultConfig.value.networkTransportUseSystemProxy),
  'optionalNetworkTransportAllowedAddressFamily': getEmptyConfigItem(defaultConfig.value.networkTransportAllowedAddressFamily),
  'optionalUserScript': getEmptyConfigItem(defaultConfig.value.userScript),
  'optionalSaveStreamCover': getEmptyConfigItem(defaultConfig.value.saveStreamCover),
  'optionalFlvWriteMetadata': getEmptyConfigItem(defaultConfig.value.flvWriteMetadata),
  'optionalTitleFilterPatterns': getEmptyConfigItem(defaultConfig.value.titleFilterPatterns),
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
      message.error(`加载默认配置失败，可能部分设置项默认值与录播姬不一致，请注意。`);
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
    isChanged.value = false;
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


const showAdvanced = ref(false);

// 文件名预览

const showFileNamePreviewModal = ref(false);

function toggleFileNamePreviewModal() {
  showFileNamePreviewModal.value = !showFileNamePreviewModal.value;
}
function handleFileNamePreviewModalClose(newTemplate: string) {
  newConfig.value['optionalFileNameRecordTemplate'].value = newTemplate;
  newConfig.value['optionalFileNameRecordTemplate'].hasValue = true;
  isChanged.value = true;
}

const isChanged = ref(false);
function onChanged() {
  isChanged.value = true;
}

const containerRef = ref(document.getElementById('content-scrollbar')?.children[0] as HTMLElement);

</script>
<style scoped lang="scss">
.settings-container {
  padding: 8px;
  display: flex;
  flex-direction: row
}

.settings-container-internal {
  flex: 1;
  max-width: 700px;
  margin: auto;
  padding-bottom: 64px;
}

.setting-box {
  margin-bottom: 24px
}

.anchor {
  min-width: 9em;
  display: none
}

@media (min-width: 768px) {
  .anchor {
    display: block
  }
}

@media (min-width: 668px) {
  .settings-container {
    padding: 24px;
  }
}
</style>
