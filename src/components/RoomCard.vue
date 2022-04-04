<template>
  <n-card size="small">
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
          <n-icon :component="Radio" color="#f00" />
        </template>
        直播中
      </n-tooltip>
      <n-tooltip v-else trigger="hover">
        <template #trigger>
          <n-icon :component="Radio" />
        </template>
        摸鱼中
      </n-tooltip>
      <span
        :style="{ color: themeVars.textColor3, fontSize: themeVars.fontSizeSmall }"
      >ID {{ props.room.roomId }}</span>
      <span
        v-if="props.room.shortId"
        :style="{ color: themeVars.textColor3, fontSize: themeVars.fontSizeSmall }"
      >id {{ props.room.shortId }}</span>
    </n-space>
    <div class="detail">
      <p>{{ props.room.title }}</p>
      <p>{{ props.room.areaNameParent }} · {{ props.room.areaNameChild }}</p>
    </div>
    <div class="record-status">
      <div class="recording" v-if="props.room.recording">
        <n-icon size="20" :component="Recording" color="#f00" />录制中
      </div>
      <div class="recording" v-show="!props.room.recording && props.room.autoRecord">
        <n-icon size="20" :component="Analytics" :color="themeVars.warningColor" />监控中
      </div>
    </div>
  </n-card>
</template>
<script setup lang="ts">
import { Component, h } from 'vue';
import type { DropdownOption } from 'naive-ui';
import { NCard, NH3, NIcon, NSpace, NTooltip, NDropdown, NButton, useThemeVars } from 'naive-ui';
import { Radio, CloudDone, CloudOffline, Recording, Analytics, EllipsisVertical, PlayCircle, StopCircle, Refresh, Open, Settings, Trash } from '@vicons/ionicons5';
import { RoomDto } from '../api';

const themeVars = useThemeVars().value;

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

const emit = defineEmits(['start-record', 'stop-record', 'refresh-room-info', 'room-setting', 'start-auto-record', 'stop-auto-record', 'delete']);

function handleSelect(option: any) {
  if (option !== 'open-room') {
    emit(option);
  }
}

</script>

<style scoped lang="sass">

.detail
  > p
    margin: 0
.record-status
  display: flex
  > div
    display: flex
</style>
