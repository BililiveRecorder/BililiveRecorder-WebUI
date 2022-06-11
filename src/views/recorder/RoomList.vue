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
import { RoomDto } from '../../api';
import { onMounted, ref } from 'vue';
import {
  NSpace, NGrid, NGridItem, NModal,
  NH2, NButton, NIcon, NForm, NFormItem, NSelect, NInput, NSwitch,
  useLoadingBar,
} from 'naive-ui';
import RoomCard from '../../components/RoomCard.vue';
import { Sync } from '@vicons/ionicons5';
import { FormInst, FormRules } from 'naive-ui/lib/form/src/interface';
import { recorderController } from '../../components/RecorderProvider';

const loadingBar = useLoadingBar();
const order = ref('none');

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

let rooms: RoomDto[] = [];

async function getRoomList() {
  loadingBar.start();
  try {
    if (recorderController.recorder == null) {
      loadingBar.error();
      return;
    }
    const res = await recorderController.recorder.getRoomList();
    rooms = res;
    loadingBar.finish();
    resort();
  } catch (error) {
    loadingBar.error();
    console.error(error);
  }
}

onMounted(() => {
  getRoomList();
});

const orderedRoom = ref(rooms);
function resort() {
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
    return;
  }
  try {
    await recorderController.recorder.startRecord(room.roomId);
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
  }
}

async function stopRecord(room: RoomDto) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    return;
  }
  try {
    await recorderController.recorder.stopRecord(room.roomId);
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
  }
}

async function startAutoRecord(room: RoomDto) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    return;
  }
  try {
    await recorderController.recorder.setRoomConfig(room.roomId, { autoRecord: true });
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
  }
}

async function stopAutoRecord(room: RoomDto) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    return;
  }
  try {
    await recorderController.recorder.setRoomConfig(room.roomId, { autoRecord: false });
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
  }
}

async function addNewRoom(roomid: number, autoRecord: boolean = true) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    return;
  }
  try {
    await recorderController.recorder.addRoom(roomid, autoRecord);
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
  }
}

async function deleteRoom(room: RoomDto) {
  loadingBar.start();
  if (recorderController.recorder == null) {
    loadingBar.error();
    return;
  }
  try {
    await recorderController.recorder.removeRoom(room.roomId);
    loadingBar.finish();
    getRoomList();
  } catch (error) {
    loadingBar.error();
    console.error(error);
  }
}

function selfUpdateRoom(room: RoomDto, i: number) {
  orderedRoom.value = rooms.map((r) => {
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
        return /(?:^https?:\/\/live\.bilibili\.com\/(?:blanc\/)(\d+)(?:.*)$)|(^\d+$)/.test(value);
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
    const roomId = roomIdString.match(/^https?:\/\/live\.bilibili\.com\/(?:blanc\/)(\d+)(?:.*)$/) || [, roomIdString];
    toggleNewRoomDialog();
    // @ts-expect-error
    addNewRoom(parseInt(roomId[1], 10), newRoomModel.value.autoRecord);
  });
}


</script>

<style lang="sass">

</style>
