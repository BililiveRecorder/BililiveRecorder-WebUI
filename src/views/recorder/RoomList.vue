<template>
  <div class="room-list-container">
    <n-space justify="space-between">
      <n-h2>房间列表</n-h2>
      <n-space>
        <n-select style="min-width: 100px;" v-model:value="order" :options="orderOptions" @update:value="getRoomList" />
        <n-button @click="getRoomList">
          <template #icon>
            <n-icon :component="Sync" />
          </template>
        </n-button>
        <n-button @click="toggleNewRoomDialog">添加房间</n-button>
      </n-space>
    </n-space>
    <n-grid x-gap="12" y-gap="12" cols="1 750:2 1100:3 1450:4 1800:5 2150:6 2500:7 2850:8">
      <n-grid-item v-for="room, i in orderedRoom" :key="room.objectId">
        <room-card :room="room" v-on:start-record="startRecord(room)" v-on:stop-record="stopRecord(room)"
          v-on:start-auto-record="startAutoRecord(room)" v-on:stop-auto-record="stopAutoRecord(room)"
          v-on:delete="deleteRoom(room)" v-on:self-update="(room) => { selfUpdateRoom(room, i) }"
          v-on:show-stats="handleShowStat(room)" />
      </n-grid-item>
    </n-grid>
    <n-modal v-model:show="showNewRoomDialog" style="max-width: 600px;" preset="card" title="添加房间">
      <n-form ref="newRoomFormRef" :model="newRoomModel" :rules="newRoomRules">
        <n-form-item path="roomId" label="房间号">
          <n-input v-model:value="newRoomModel.roomId" />
        </n-form-item>
        <n-form-item path="autoRecord" label="自动录制">
          <n-switch v-model:value="newRoomModel.autoRecord" />
        </n-form-item>
      </n-form>
      <n-space justify="end">
        <n-button @click="showNewRoomDialog = false">取消</n-button>
        <n-button primary @click="onNewRoomFormSubmit">添加</n-button>
      </n-space>
    </n-modal>
    <n-drawer :show="showStatDrawer" :placement="'right'" @update:show="onStatDrawerUpdate" :width="400">
      <n-drawer-content :title="statRoom?.name" :native-scrollbar="false">
        <div class="recording-stats">
          <h3>录制统计数据</h3>
          <p>会话时长：{{ msToHuman(statRoom?.recordingStats.sessionDuration || 0) }}</p>
          <p>总接受字节数: {{ byteToHuman(statRoom?.recordingStats.totalInputBytes || 0) }}</p>
          <p>总写入字节数: {{ byteToHuman(statRoom?.recordingStats.totalOutputBytes || 0) }}</p>
          <p>当前文件的大小： {{ byteToHuman(statRoom?.recordingStats.currentFileSize || 0) }}</p>
          <p>总时长：{{ msToHuman(statRoom?.recordingStats.fileMaxTimestamp || 0) }}</p>
          <p>录制速度比例：{{ ((statRoom?.recordingStats.durationRatio || 0) * 100).toFixed(2) }} %</p>
          <p>统计区间的直播数据时长：{{ statRoom?.recordingStats.addedDuration || 0 }} 毫秒</p>
          <p>统计区间所经过的时长：{{ statRoom?.recordingStats.passedTime || 0 }} 毫秒</p>
          <p>统计区间内收到视频数据： {{ byteToHuman(statRoom?.recordingStats.inputVideoBytes || 0) }}</p>
          <p>统计区间内收到音频数据： {{ byteToHuman(statRoom?.recordingStats.inputAudioBytes || 0) }}</p>
          <p>统计区间内新写入视频帧：{{ statRoom?.recordingStats.outputVideoFrames }}</p>
          <p>统计区间内新写入音频帧：{{ statRoom?.recordingStats.outputAudioFrames }}</p>
          <p>统计区间内新写入视频：{{ byteToHuman(statRoom?.recordingStats.outputVideoBytes || 0) }}</p>
          <p>统计区间内新写入音频：{{ byteToHuman(statRoom?.recordingStats.outputAudioBytes || 0) }}</p>
          <p>总共收到的视频数据：{{ byteToHuman(statRoom?.recordingStats.totalInputVideoBytes || 0) }}</p>
          <p>总共收到的音频数据：{{ byteToHuman(statRoom?.recordingStats.totalInputAudioBytes || 0) }}</p>
          <p>总共写入的视频帧：{{ statRoom?.recordingStats.totalOutputVideoFrames || 0 }}</p>
          <p>总共写入的音频帧：{{ statRoom?.recordingStats.totalOutputAudioFrames || 0 }}</p>
          <p>总共写入的视频数据：{{ byteToHuman(statRoom?.recordingStats.totalOutputVideoBytes || 0) }}</p>
          <p>总共写入的音频数据：{{ byteToHuman(statRoom?.recordingStats.totalOutputAudioBytes || 0) }}</p>
        </div>
        <div class="io-stats">
          <h3>IO 统计数据</h3>
          <p>统计区间的开始时间：{{ dateToTimeWithMs(new Date(statRoom?.ioStats.startTime || 0)) }}</p>
          <p>统计区间的结束时间：{{ dateToTimeWithMs(new Date(statRoom?.ioStats.endTime || 0)) }}</p>
          <p>统计区间的时长：{{ statRoom?.ioStats.duration || 0 }} 毫秒</p>
          <p>统计区间内下载数据：{{ byteToHuman(statRoom?.ioStats.networkBytesDownloaded || 0) }}</p>
          <p>平均下载速度：{{ statRoom?.ioStats.networkMbps.toFixed(2) }} Mbps</p>
          <p>统计区间磁盘写入耗时：{{ statRoom?.ioStats.diskWriteDuration || 0 }} 毫秒</p>
          <p>统计区间磁盘写入数据：{{ byteToHuman(statRoom?.ioStats.diskBytesWritten || 0) }}</p>
          <p>平均写入速度：{{ statRoom?.ioStats.diskMBps.toFixed(2) || 0 }} MBps</p>
        </div>
        <template #footer>
          <n-button @click="showStatDrawer = false">关闭</n-button>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { RoomDto } from '../../utils/api';
import { h, onMounted, onUnmounted, ref } from 'vue';
import {
  NSpace, NGrid, NGridItem, NModal, NDrawer, NDrawerContent, NTime,
  NH2, NButton, NIcon, NForm, NFormItem, NSelect, NInput, NSwitch,
  useLoadingBar, useMessage, useNotification, NotificationReactive,
} from 'naive-ui';
import RoomCard from '../../components/RoomCard.vue';
import { Sync } from '@vicons/ionicons5';
import { FormInst, FormRules } from 'naive-ui/lib/form/src/interface';
import { recorderController } from '../../utils/RecorderController';
import { msToHuman, byteToHuman, dateToTimeWithMs } from '../../utils/unitConvert';

const message = useMessage();
const loadingBar = useLoadingBar();
const notification = useNotification();
const order = ref('none');

let pullStatFailCount = 0;

const orderOptions = [
  {
    label: '不排序',
    value: 'none',
  },
  {
    label: '房间号',
    value: 'room_id',
  },
  {
    label: '录制状态',
    value: 'status',
  },
];

async function getRoomList() {
  loadingBar.start();
  try {
    if (recorderController.recorder == null) {
      loadingBar.error();
      return;
    }
    const res = await recorderController.recorder.getRoomList();
    loadingBar.finish();
    pullStatFailCount = 0;
    resort(res);
    return res;
  } catch (error) {
    loadingBar.error();
    console.error(error);
  }
}

onMounted(() => {
  getRoomList();
});

const orderedRoom = ref<RoomDto[]>([]);
function resort(rooms: RoomDto[]) {
  orderedRoom.value = rooms.sort((a, b) => {
    if (order.value === 'none') {
      return 0;
    }
    if (order.value === 'room_id') {
      return a.roomId - b.roomId;
    }
    if (order.value === 'status') {
      if (a.recording && !b.recording) {
        return -1;
      }
      if (!a.recording && b.recording) {
        return 1;
      }
      return 0;
    }
    return 0;
  });
}

async function startRecord(room: RoomDto) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    message.error('recorder is null');
    return;
  }
  try {
    await recorderController.recorder.startRecord(room.roomId);
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
    message.error('开始录制失败');
  }
}

async function stopRecord(room: RoomDto) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    message.error('recorder is null');
    return;
  }
  try {
    await recorderController.recorder.stopRecord(room.roomId);
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
    message.error('停止录制失败');
  }
}

async function startAutoRecord(room: RoomDto) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    message.error('recorder is null');
    return;
  }
  try {
    await recorderController.recorder.setRoomConfig(room.roomId, { autoRecord: true });
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
    message.error('启用自动录制失败');
  }
}

async function stopAutoRecord(room: RoomDto) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    message.error('recorder is null');
    return;
  }
  try {
    await recorderController.recorder.setRoomConfig(room.roomId, { autoRecord: false });
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
    message.error('禁用自动录制失败');
  }
}

async function addNewRoom(roomid: number, autoRecord: boolean = true) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    message.error('recorder is null');
    return;
  }
  try {
    await recorderController.recorder.addRoom(roomid, autoRecord);
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
    message.error('添加房间失败');
  }
}

async function deleteRoom(room: RoomDto) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    message.error('recorder is null');
    return;
  }
  try {
    await recorderController.recorder.removeRoom(room.roomId);
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
    message.error('删除房间失败');
  }
}

function selfUpdateRoom(room: RoomDto, i: number) {
  orderedRoom.value[i] = room;
}

// new room
interface NewRoomModelType {
  roomId: string;
  autoRecord: boolean;
}

const ROOM_ID_FROM_LINK_REGEX = /^(?:(?:https?:\/\/)?live\.bilibili\.com\/(?:blanc\/|h5\/)?)?(\d*)(?:\?.*)?$/;

const showNewRoomDialog = ref(false);
const newRoomFormRef = ref<FormInst | null>(null);
const newRoomRules: FormRules = {
  roomId: [
    {
      required: true,
      message: '请输入房间号或房间链接',
    },
    {
      validator: (rule, value) => {
        return ROOM_ID_FROM_LINK_REGEX.test(value);
      },
      message: '请输入正确的房间号或房间链接',
      trigger: ['input', 'blur'],
    },
  ],
};
const newRoomModel = ref<NewRoomModelType>({
  roomId: '',
  autoRecord: true,
});
function toggleNewRoomDialog() {
  showNewRoomDialog.value = !showNewRoomDialog.value;
}
async function onNewRoomFormSubmit() {
  newRoomFormRef.value?.validate((errors: any) => {
    if (errors) {
      return;
    }
    const roomIdString = newRoomModel.value.roomId;
    const roomId = roomIdString.match(ROOM_ID_FROM_LINK_REGEX) || [, roomIdString];
    toggleNewRoomDialog();
    // @ts-expect-error
    addNewRoom(parseInt(roomId[1], 10), newRoomModel.value.autoRecord);
  });
}

interface RoomStat {
  r: {
    o: string;
    r: boolean;
    s: boolean;
    i: {
      n: number | 'NaN';
    };
    r2: {
      b: number | 'NaN';
      t: number | 'NaN';
    }
  }[];
}
let failNotification: NotificationReactive | null;
function updateRoomStat() {
  recorderController.recorder?.graphql<RoomStat>('q', 'query q{' +
    'r:rooms{o:objectId s:streaming r:recording i:ioStats{n:networkMbps}' +
    'r2:recordingStats{b:durationRatio t:sessionMaxTimestamp}}}', null)
    .then((data) => {
      let isUnSync = false;
      orderedRoom.value.forEach((room, i) => {
        const index = data.r.findIndex((r) => r.o === room.objectId);
        if (index === -1) {
          isUnSync = true;
          return;
        }
        const roomStat = data.r[index];
        data.r.splice(index, 1);
        room.streaming = roomStat.s;
        room.recording = roomStat.r;
        room.ioStats.networkMbps = typeof roomStat.i.n !== 'number' ? 0 : roomStat.i.n;
        room.recordingStats.durationRatio = typeof roomStat.r2.b !== 'number' ? 0 : roomStat.r2.b;
        room.recordingStats.sessionMaxTimestamp = typeof roomStat.r2.t !== 'number' ? 0 : roomStat.r2.t;
      });
      if (data.r.length > 0) {
        isUnSync = true;
      }
      if (isUnSync) {
        setTimeout(getRoomList, 100);
      }
    }).catch((e) => {
      console.error(e);
      pullStatFailCount++;
      if (pullStatFailCount >= 5) {
        if (failNotification) {
          failNotification.destroy();
        }
        failNotification = notification.error({
          title: '拉取统计失败!',
          description: `已连续${pullStatFailCount}次拉取统计失败，请检查录播姬运行状态或网络连接`,
          action: () => h(NButton, {
            text: true,
            type: 'primary',
            onClick: () => {
              if (failNotification) {
                failNotification.destroy();
              }
              failNotification = null;
              updateRoomStat();
            },
          }, { default: () => '再试试' }),
        });
      }
    });
}

let updateInterval: any;
let hiddenCount = 0;
function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    if (hiddenCount > 100) {
      hiddenCount = 0;
      updateRoomStat();
    }
  }
}
onMounted(() => {
  updateInterval = setInterval(() => {
    if (document.visibilityState === 'hidden') {
      hiddenCount++;
      return;
    } else {
      hiddenCount = 0;
    }
    if (pullStatFailCount >= 5) {
      return;
    }
    updateRoomStat();
  }, 5000);
  document.addEventListener('visibilitychange', onVisibilityChange);
});
onUnmounted(() => {
  clearInterval(updateInterval);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});

// stat drawer

const showStatDrawer = ref(false);
const statTargetRoomObjectId = ref<string | null>(null);
const statRoom = ref<RoomDto | null>(null);

let updateRoomInfoInterval: number | null = null;
const updateRoomInfo = (objectId: string) => {
  if (recorderController.recorder == null) {
    message.error('recorder is null');
    return;
  }
  recorderController.recorder.getRoomByObjectId(objectId).then((room) => {
    orderedRoom.value.forEach((r, i) => {
      if (r.objectId === room.objectId) {
        orderedRoom.value[i] = room;
      }
    });
    statRoom.value = room;
  }).catch((e) => {
    console.error(e);
    message.error('get room failed');
  });
};

const handleShowStat = (room: RoomDto) => {
  console.log('show stat', room);
  statTargetRoomObjectId.value = room.objectId;
  statRoom.value = room;
  if (updateRoomInfoInterval) {
    clearInterval(updateRoomInfoInterval);
  }
  updateRoomInfo(room.objectId);
  updateRoomInfoInterval = setInterval(() => {
    if (statTargetRoomObjectId.value) {
      updateRoomInfo(statTargetRoomObjectId.value);
    } else if (updateRoomInfoInterval) {
      clearInterval(updateRoomInfoInterval);
    }
  }, 2000);
  showStatDrawer.value = true;
};

const onStatDrawerUpdate = (show: boolean) => {
  if (!show) {
    if (updateRoomInfoInterval) {
      clearInterval(updateRoomInfoInterval);
      updateRoomInfoInterval = null;
    }
  }
  showStatDrawer.value = show;
};

onUnmounted(() => {
  if (updateRoomInfoInterval) {
    clearInterval(updateRoomInfoInterval);
    updateRoomInfoInterval = null;
  }
});

</script>
<style lang="scss" scoped>
.room-list-container {
  padding: 24px;
}

.recording-stats,
.io-stats {

  p,
  h3 {
    margin: 0;
  }
}
</style>
