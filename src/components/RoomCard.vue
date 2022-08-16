<template>
  <n-card size="small" :style="{ height: '100%' }">
    <n-space justify="space-between" :align="'center'">
      <n-h3 style="margin: 0;">{{ props.room.name }}</n-h3>
      <n-dropdown trigger="hover" :options="actions" @select="handleSelect">
        <n-button quaternary round>
          <template #icon>
            <n-icon :component="EllipsisVertical" />
          </template>
        </n-button>
      </n-dropdown>
    </n-space>
    <n-space>
      <n-tooltip v-if="props.room.danmakuConnected" trigger="hover">
        <template #trigger>
          <n-icon :component="CloudDone" :color="themeVars.successColor" />
        </template>
        弹幕服务器已连接
      </n-tooltip>
      <n-tooltip v-else trigger="hover">
        <template #trigger>
          <n-icon :component="CloudOffline" :color="themeVars.errorColor" />
        </template>
        弹幕服务器未连接
      </n-tooltip>
      <n-tooltip v-if="props.room.streaming" trigger="hover">
        <template #trigger>
          <n-icon :component="Radio" color="#a00" />
        </template>
        直播中
      </n-tooltip>
      <n-tooltip v-else trigger="hover">
        <template #trigger>
          <n-icon :component="Radio" />
        </template>
        摸鱼中
      </n-tooltip>
      <span :style="{ color: themeVars.textColor3, fontSize: themeVars.fontSizeSmall }">
        ID {{ props.room.roomId }}
      </span>
      <span v-if="props.room.shortId" :style="{ color: themeVars.textColor3, fontSize: themeVars.fontSizeSmall }">
        id {{ props.room.shortId }}
      </span>
    </n-space>
    <div class="detail">
      <p>{{ props.room.title }}</p>
      <p>{{ props.room.areaNameParent }} · {{ props.room.areaNameChild }}</p>
    </div>
    <div class="record-status">
      <div class="recording" v-if="props.room.recording">
        <n-icon size="20" :component="RecordingOutline" color="#a00" />
        录制中({{ msToHuman(props.room.recordingStats.sessionMaxTimestamp) }})
      </div>
      <div class="recording" v-show="!props.room.recording && props.room.autoRecord">
        <n-icon size="20" :component="Analytics" :color="themeVars.warningColor" />监控中
      </div>
      <div v-if="props.room.recording">
        <n-popover class="network" :delay="500" :duration="500" :show="isPopoverShow"
        @update:show="handlePopoverVisibleChange">
        <template #trigger>
          <n-button quaternary size="small" :style="{ margin: '0 -0.5em' }">
            <n-gradient-text :type="statColor(props.room.recordingStats.durationRatio)" @click="emit('show-stats')">
              {{ props.room.ioStats.networkMbps.toFixed(2) }} Mbps
            </n-gradient-text>
          </n-button>
        </template>
        <div class="stat" v-if="isDataLoaded">
          <p>服务器：{{ stat.streamHost }}</p>
          <p>下载速度：{{ stat.networkMbps.toFixed(2) }} Mbps</p>
          <p>录制速度比例：{{ (stat.durationRatio * 100).toFixed(2) }} %</p>
          <p>文件大小：{{ byteToHuman(stat.currentFileSize) }}</p>
          <p>会话时长：{{ msToHuman(stat.sessionDuration) }}</p>
          <p>已录制时长：{{ msToHuman(stat.sessionMaxTimestamp) }}</p>
        </div>
        <div class="stat" v-else>
          <p v-for="i in 6" :key="i">
            <n-skeleton text :style="{ width: '300px' }" />
          </p>
        </div>
      </n-popover>
      <n-popover>
        <template #trigger>
          <n-button quaternary size="small" @click="splitRecord">
            <n-icon :component="CutSharp" />
          </n-button>
        </template>
        <span>手动分段</span>
      </n-popover>
      </div>
    </div>
    <!-- TODO: 独立成模块 -->
    <n-modal :title="'房间设置 ' + props.room.roomId" v-model:show="showSettingDialog" preset="card"
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
          <optional-input type="boolean" label="自动录制" v-model:value="newRoomConfig['autoRecord']"
            :hide-default="true" />
        </div>
        <div id="record-mode" class="setting-box">
          <n-h3>录制模式</n-h3>
          <optional-input type="enum" v-model:value="newRoomConfig['optionalRecordMode']" :enums="RecordModes" />
          <n-collapse-transition :show="newRoomConfig['optionalRecordMode']?.value == 0">
            <n-h3>标准模式录制修复设置</n-h3>
            <optional-input type="boolean" label="检测到可能缺少数据时分段"
              v-model:value="newRoomConfig['optionalFlvProcessorSplitOnScriptTag']" :same-as-default="true" />
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
        </div>
        <div id="record-quality" class="setting-box">
          <n-h3>录制画质</n-h3>
          <optional-input style="max-width: 700px;" type="text"
            v-model:value="newRoomConfig['optionalRecordingQuality']" :same-as-default="false" />
        </div>
        <div id="danmaku-record" class="setting-box">
          <n-h3>弹幕录制</n-h3>
          <optional-input type="boolean" label="保存弹幕" v-model:value="newRoomConfig['optionalRecordDanmaku']" />
          <p>本设置同时是所有“弹幕录制”的总开关，当本设置为 false 时其他所有“弹幕录制”设置无效，不会写入弹幕XML文件。</p>
          <n-collapse-transition :show="newRoomConfig['optionalRecordDanmaku'].value">
            <optional-input type="boolean" label="保存 SuperChat"
              v-model:value="newRoomConfig['optionalRecordDanmakuSuperChat']" />
            <optional-input type="boolean" label="保存 舰长购买"
              v-model:value="newRoomConfig['optionalRecordDanmakuGuard']" />
            <optional-input type="boolean" label="保存 送礼信息" v-model:value="newRoomConfig['optionalRecordDanmakuGift']" />
            <optional-input type="boolean" label="保存 弹幕原始数据"
              v-model:value="newRoomConfig['optionalRecordDanmakuRaw']" />
          </n-collapse-transition>
        </div>
      </div>
      <template #action>
        <n-space justify="end">
          <n-button :loading="saving" :disabled="loading" @click="saveConfig">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>
<script lang="ts">
import { Component, h, onMounted, onUnmounted, PropType, ref, watch } from 'vue';
import {
  DropdownOption, useLoadingBar, useMessage, NCollapseTransition, NCard, NH3, NIcon,
  NSpace, NTooltip, NDropdown, NButton, NModal, NSkeleton, useThemeVars, NPopover,
  NGradientText,
} from 'naive-ui';
import {
  Radio, CloudDone, CloudOffline, RecordingOutline, Analytics, EllipsisVertical,
  PlayCircle, StopCircle, Refresh, Open, Settings, Trash, CutSharp,
} from '@vicons/ionicons5';
import { Recorder, RoomDto, Optional } from '../utils/api';
import { byteToHuman, msToHuman } from '../utils/unitConvert';
import OptionalInput from '../components/OptionalInput.vue';
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
<script setup lang="ts">

const themeVars = useThemeVars();

const message = useMessage();
const loadingbar = useLoadingBar();

const newRoomConfig = ref<{ [key: string]: ConfigItem }>({});

const props = defineProps({
  room: {
    type: Object as PropType<RoomDto>,
    required: true,
    default: (): RoomDto => ({
      'objectId': '00000000-0000-0000-0000-000000000000',
      'roomId': 0,
      'autoRecord': false,
      'shortId': 0,
      'name': '用户昵称',
      'title': '直播间标题',
      'areaNameParent': '一级分区',
      'areaNameChild': '二级分区',
      'recording': false,
      'streaming': false,
      'danmakuConnected': true,
      'autoRecordForThisSession': true,
      'recordingStats': {
        'sessionDuration': 0,
        'totalInputBytes': 0,
        'totalOutputBytes': 0,
        'currentFileSize': 0,
        'sessionMaxTimestamp': 0,
        'fileMaxTimestamp': 0,
        'addedDuration': 0,
        'passedTime': 0,
        'durationRatio': 0,
        'inputVideoBytes': 0,
        'inputAudioBytes': 0,
        'outputVideoFrames': 0,
        'outputAudioFrames': 0,
        'outputVideoBytes': 0,
        'outputAudioBytes': 0,
        'totalInputVideoBytes': 0,
        'totalInputAudioBytes': 0,
        'totalOutputVideoFrames': 0,
        'totalOutputAudioFrames': 0,
        'totalOutputVideoBytes': 0,
        'totalOutputAudioBytes': 0,
      },
      'ioStats': {
        'streamHost': '',
        'startTime': '',
        'endTime': '',
        'duration': 0,
        'networkBytesDownloaded': 0,
        'networkMbps': 0,
        'diskWriteDuration': 0,
        'diskBytesWritten': 0,
        'diskMBps': 0,
      },
    }),
  },
  new: {
    type: Boolean,
    default: false,
  },
  globalUpdating: {
    type: Boolean,
    default: false,
  },
});

const renderIcon = (icon: Component) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon),
    });
  };
};

const actions: DropdownOption[] = [
  {
    label: '开始录制',
    key: 'start-record',
    icon: renderIcon(PlayCircle),
  },
  {
    label: '停止录制',
    key: 'stop-record',
    icon: renderIcon(StopCircle),
  },
  {
    label: '刷新直播间信息',
    key: 'refresh-room-info',
    icon: renderIcon(Refresh),
  },
  {
    label: () => {
      return h('a', {
        href: 'https://live.bilibili.com/' + props.room.roomId,
        target: '_blank',
      }, '打开直播间');
    },
    key: 'open-room',
    icon: renderIcon(Open),
  },
  {
    type: 'divider',
    key: 'd1',
  },
  {
    label: '房间设置',
    key: 'room-setting',
    icon: renderIcon(Settings),
  },
  {
    type: 'divider',
    key: 'd2',
  },
  {
    label: '开启自动录制',
    key: 'start-auto-record',
    icon: renderIcon(Analytics),
  },
  {
    label: '禁用自动录制',
    key: 'stop-auto-record',
  },
  {
    type: 'divider',
    key: 'd3',
  },
  {
    label: '删除房间',
    key: 'delete-room',
    icon: renderIcon(Trash),
    children: [
      {
        label: '确定吗？',
        key: 'confirm',
        children: [
          {
            label: '删除',
            key: 'delete',
            icon: renderIcon(Trash),
          },
        ],
      },
    ],
  },
];

const emit = defineEmits(['start-record', 'stop-record', 'refresh-room-info', 'start-auto-record',
  'stop-auto-record', 'delete', 'self-update', 'show-stats']);
const showSettingDialog = ref(false);
const loading = ref(true);


interface ConfigItem<T = any> {
  hasValue: boolean,
  value: T,
  defaultValue: T,
}

async function initSetting() {
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
    roomConfig = await recorderController.recorder.getRoomConfigByObjectId(props.room.objectId) as any;
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
    showSettingDialog.value = false;
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
    await recorderController.recorder.setRoomConfigByObjectId(props.room.objectId, toSave);
    msg.destroy();
    message.success('保存成功');
    loadingbar.finish();
    showSettingDialog.value = false;
    saving.value = false;
  } catch (error: any) {
    msg.destroy();
    message.error(error?.message || error.toString());
    message.error('保存失败，请检查网络');
    loadingbar.error();
    saving.value = false;
  }
}

function handleSelect(option: any) {
  switch (option) {
    case 'open-room':
      break;
    case 'room-setting':
      initSetting();
      showSettingDialog.value = true;
      break;
    default:
      emit(option);
  }
}

let recheckTimeout: any;

function requireRecheck() {
  if (recheckTimeout) {
    clearTimeout(recheckTimeout);
  }
  recheckTimeout = setTimeout(() => {
    if (recorderController.recorder == null) {
      return;
    }
    recorderController.recorder.getRoomByObjectId(props.room.objectId).then((room) => {
      emit('self-update', room);
    }).catch((error) => {
      console.error(error);
    });
    recheckTimeout = void 0;
  }, 1000);
}

onMounted(() => {
  if (!props.room.danmakuConnected) {
    requireRecheck();
  }
});

onUnmounted(() => {
  if (recheckTimeout) {
    clearTimeout(recheckTimeout);
  }
});

const failCount = ref(0);
const stat = ref({
  streamHost: '',
  networkMbps: 0,
  durationRatio: 0,
  currentFileSize: 0,
  sessionDuration: 0,
  sessionMaxTimestamp: 0,
});
// these two will be update by outside, so we need to watch them
watch(props.room.ioStats, (newVal) => {
  stat.value.networkMbps = newVal.networkMbps;
});
watch(props.room.recordingStats, (newVal) => {
  stat.value.durationRatio = newVal.durationRatio;
});
interface QueryResult {
  r: {
    i: {
      n: number;
      h: string;
    },
    r: {
      r: number;
      s: number;
      d: number;
      t: number;
    }
  }
}
function pullStat() {
  if (recorderController.recorder == null) {
    return;
  }
  recorderController.recorder.graphql<QueryResult>('q',
    'query q($o:ID){r:room(objectId:$o){i:ioStats{n:networkMbps h:streamHost}r:recordingStats{r:durationRatio s:currentFileSize d:sessionDuration t:sessionMaxTimestamp}}}',
    { o: props.room.objectId })
    .then((data) => {
      stat.value.streamHost = data.r.i.h;
      stat.value.networkMbps = data.r.i.n;
      stat.value.durationRatio = data.r.r.r;
      stat.value.currentFileSize = data.r.r.s;
      stat.value.sessionDuration = data.r.r.d;
      stat.value.sessionMaxTimestamp = data.r.r.t;
      isDataLoaded.value = true;
    })
    .catch((error) => {
      failCount.value++;
      if (failCount.value >= 5) {
        isDataLoaded.value = false;
      }
      message.error('拉取录制统计数据失败：' + error?.message || error.toString());
      console.error(error);
    });
}
const isPopoverShow = ref(false);
const isDataLoaded = ref(false);
let pullStatInterval: number | null = null;
function handlePopoverVisibleChange(visible: boolean) {
  isPopoverShow.value = visible;
  if (visible) {
    isDataLoaded.value = false;
    failCount.value = 0;
    pullStat();
    if (pullStatInterval) {
      clearInterval(pullStatInterval);
    }
    pullStatInterval = setInterval(() => {
      if (document.hidden) {
        return;
      }
      pullStat();
    }, 1000);
  } else {
    if (pullStatInterval) {
      clearInterval(pullStatInterval);
    }
    pullStatInterval = null;
  }
}
onUnmounted(() => {
  if (pullStatInterval) {
    clearInterval(pullStatInterval);
  }
});


function statColor(ratio: number) {
  if (ratio > 0.95) {
    return 'success';
  }
  if (ratio > 0.8) {
    return 'warning';
  }
  return 'error';
}

async function splitRecord() {
  if (recorderController.recorder == null) {
    return;
  }
  recorderController.recorder.splitRecordByObjectId(props.room.objectId).then((e)=>{
    emit('self-update', e);
    message.success('手动分段成功');
  }).catch((e)=>{
    message.error('手动分段失败：' + e?.message || e.toString());
    console.error(e);
  });
}


</script>

<style scoped lang="scss">
.detail {
  >p {
    margin: 0;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.record-status {
  display: flex;
  justify-content: space-between;
  align-items: center;

  >div {
    display: flex;
  }
}

.setting-box {
  margin-bottom: 24px;
}

.stat {
  >p {
    margin: 0;
  }
}

.n-gradient-text {
  font-weight: bold;
  // no, it works, but bad cpu usage
  // background-size: 200% auto;
  // background-image: linear-gradient(252deg, var(--n-color-start) 0%, var(--n-color-end) 50%, var(--n-color-start) 100%);
  // animation: 1s roll linear infinite forwards;
}

// @keyframes roll {
//   to {
//     background-position: 200% center;
//   }
// }
</style>
