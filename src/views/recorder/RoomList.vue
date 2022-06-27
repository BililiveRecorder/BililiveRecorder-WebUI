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
          v-on:delete="deleteRoom(room)" v-on:self-update="(room) => { selfUpdateRoom(room, i) }" />
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
  </div>
</template>

<script setup lang="ts">
import { RoomDto } from '../../utils/api';
import { h, onMounted, onUnmounted, ref } from 'vue';
import {
  NSpace, NGrid, NGridItem, NModal,
  NH2, NButton, NIcon, NForm, NFormItem, NSelect, NInput, NSwitch,
  useLoadingBar, useMessage, useNotification, NotificationReactive,
} from 'naive-ui';
import RoomCard from '../../components/RoomCard.vue';
import { Sync } from '@vicons/ionicons5';
import { FormInst, FormRules } from 'naive-ui/lib/form/src/interface';
import { recorderController } from '../../utils/RecorderController';

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
  orderedRoom.value = orderedRoom.value.map((r) => {
    if (r.objectId === room.objectId) {
      return room;
    }
    return r;
  });
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
    a: {
      a: number | 'NaN';
    };
    b: {
      b: number | 'NaN';
    }
  }[];
}
let failNotification: NotificationReactive | null;
function updateRoomStat() {
  recorderController.recorder?.graphql<RoomStat>('q', 'query q{r:rooms{o:objectId s:streaming r:recording a:ioStats{a:networkMbps}b:recordingStats{b:durationRatio}}}', null)
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
        room.ioStats.networkMbps = typeof roomStat.a.a !== 'number' ? 0 : roomStat.a.a;
        room.recordingStats.durationRatio = typeof roomStat.b.b !== 'number' ? 0 : roomStat.b.b;
      });
      if (data.r.length > 0) {
        isUnSync = true;
      }
      if (isUnSync) {
        setTimeout(getRoomList, 100);
      }
    }).catch((e) => {
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

</script>
<style lang="scss" scoped>
.room-list-container {
  padding: 24px;
}
</style>
