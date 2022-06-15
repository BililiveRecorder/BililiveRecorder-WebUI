<template>
  <n-card size="small" :style="{ height: '100%' }">
    <template #header>
      <n-h3 style="margin: 0;">{{ props.room.name }}</n-h3>
    </template>
    <template #header-extra>
      <n-dropdown trigger="hover" :options="actions" @select="handleSelect">
        <n-button quaternary round>
          <template #icon>
            <n-icon :component="EllipsisVertical" />
          </template>
        </n-button>
      </n-dropdown>
    </template>
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
        ID {{
            props.room.roomId
        }}
      </span>
      <span v-if="props.room.shortId" :style="{ color: themeVars.textColor3, fontSize: themeVars.fontSizeSmall }">
        id {{
            props.room.shortId
        }}
      </span>
    </n-space>
    <div class="detail">
      <p>{{ props.room.title }}</p>
      <p>{{ props.room.areaNameParent }} · {{ props.room.areaNameChild }}</p>
    </div>
    <div class="record-status">
      <div class="recording" v-if="props.room.recording">
        <n-icon size="20" :component="RecordingOutline" color="#a00" />录制中
      </div>
      <div class="recording" v-show="!props.room.recording && props.room.autoRecord">
        <n-icon size="20" :component="Analytics" :color="themeVars.warningColor" />监控中
      </div>
    </div>
    <n-modal :title="'房间设置 ' + props.room.roomId" v-model:show="showSettingDialog" preset="card"
      :style="{ maxWidth: '800px', maxHeight: '95vh' }">
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
      <template #footer>
        <n-space justify="end">
          <n-button :loading="saving" :disabled="loading" @click="saveConfig">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>
<script setup lang="ts">
import { Component, h, onMounted, onUnmounted, ref } from 'vue';
import { DropdownOption, useLoadingBar, useMessage, NCollapseTransition, NCard, NH3, NIcon, NSpace, NTooltip, NDropdown, NButton, NModal, NSkeleton, useThemeVars } from 'naive-ui';
import { Radio, CloudDone, CloudOffline, RecordingOutline, Analytics, EllipsisVertical, PlayCircle, StopCircle, Refresh, Open, Settings, Trash } from '@vicons/ionicons5';
import { Recorder, RoomDto, Optional } from '../utils/api';
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

const themeVars = useThemeVars().value;

const message = useMessage();
const loadingbar = useLoadingBar();

const newRoomConfig = ref<{ [key: string]: ConfigItem }>({});

const props = defineProps({
  room: {
    type: Object,
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
      'stats': {
        'sessionDuration': 0,
        'sessionMaxTimestamp': 0,
        'fileMaxTimestamp': 0,
        'durationRatio': 0,
        'totalInputBytes': 0,
        'totalOutputBytes': 0,
        'networkMbps': 0,
      },
    }),
  },
  new: {
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

const emit = defineEmits(['start-record', 'stop-record', 'refresh-room-info', 'start-auto-record', 'stop-auto-record', 'delete', 'self-update']);
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
    await recorderController.recorder.setRoomConfig(props.room.objectId, toSave);
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

onMounted(() => {
  if (!props.room.danmakuConnected) {
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
    }, 5000);
  }
});

onUnmounted(() => {
  if (recheckTimeout) {
    clearTimeout(recheckTimeout);
  }
});

</script>

<style scoped lang="sass">

.detail
  > p
    margin: 0
.record-status
  display: flex
  > div
    display: flex
.setting-box
  margin-bottom: 24px
</style>
