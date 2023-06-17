<template>
  <div class="container">
    <div class="control">
      <p v-if="!scanned">共有{{ recorders.length }}个录播姬，点击<n-button @click="startScan">开始</n-button>扫描重复直播间</p>
      <p v-else>共有{{ recorders.length }}个录播姬</p>
      <div style="width: min(400px, 100%);">
        <n-progress type="line" :show-indicator="false" :percentage="progress" :status="status"></n-progress>
      </div>
      <div class="log">
        <n-button quaternary size="tiny" v-if="showLog" @click="toggleLog">隐藏日志</n-button>
        <n-button quaternary size="tiny" v-else @click="toggleLog">显示日志</n-button>
        <n-collapse-transition :show="showLog">
          <p v-for="(log, i) in logs" :key="i">{{ log }}</p>
        </n-collapse-transition>
      </div>
    </div>
    <div class="filter" v-if="result.length > 0">
      过滤：
      <n-checkbox v-model:checked="displayConfig.hideOnlyOneAutoRecord">
        隐藏只有一个自动录制的房间
      </n-checkbox>
      <n-checkbox v-model:checked="displayConfig.hideAllAutoRecord">
        隐藏全部开启自动录制的房间
      </n-checkbox>
      <n-checkbox v-model:checked="displayConfig.hideAllNotAutoRecord">
        隐藏全部禁用录制的房间
      </n-checkbox>
    </div>
    <div class="result" v-if="result.length > 0">
      <n-collapse>
        <template v-for="room in result">
          <n-collapse-item :title="room.roomId + ' - ' + room.name" :name="room.roomId" :key="room.roomId"
            v-if="shouldDisplay(room)">
            <n-grid x-gap="12" y-gap="12" cols="1 750:2 1100:3 1450:4 1800:5 2150:6 2500:7 2850:8">
              <n-grid-item v-for="recorder in room.recorders" :key="recorder.id">
                <n-card :title="findRecorder(recorder.id)?.name">
                  自动录制：{{ recorder.autoRecord ? "是" : "否" }}
                </n-card>
              </n-grid-item>
            </n-grid>
          </n-collapse-item>
        </template>
      </n-collapse>
    </div>
  </div>
</template>
<script lang="ts">
import { NProgress, NButton, NCollapseTransition, NCollapse, NCollapseItem, NCard, NGrid, NCheckbox, NGridItem } from 'naive-ui';
import { recorderController, Server } from '@/utils/RecorderController';
import { Ref, ref } from 'vue';
import { Status } from 'naive-ui/es/progress/src/interface';
import { Recorder } from '@/utils/api';
interface GRoomInfo {
  r: {
    o: string,
    n: string,
    rc: {
      i: number,
      a: boolean
    }
  }[]
}
</script>

<script setup lang="ts">
const controller = recorderController;
const recorders: Ref<Server[]> = ref(controller.listServers());

const progress = ref(0);
const status: Ref<Status> = ref('info');
const logs: Ref<string[]> = ref([]);
const scanned = ref(false);
const showLog = ref(true);
const result: Ref<{ roomId: string, name: string, recorders: Array<{ id: string, autoRecord: boolean }> }[]> = ref([]);
const displayConfig = ref({
  hideAllNotAutoRecord: false,
  hideAllAutoRecord: false,
  hideOnlyOneAutoRecord: true,
});


function toggleLog() {
  showLog.value = !showLog.value;
}

function shouldDisplay(room: { roomId: string, name: string, recorders: Array<{ id: string, autoRecord: boolean }> }) {
  let c = 0;
  room.recorders.forEach((i) => {
    if (i.autoRecord) {
      c++;
    }
  });
  if (displayConfig.value.hideAllAutoRecord && c == room.recorders.length) return false;
  if (displayConfig.value.hideAllNotAutoRecord && c == 0) return false;
  if (displayConfig.value.hideOnlyOneAutoRecord && c == 1) return false;
  return true;
}

function findRecorder(id: string) {
  return recorders.value.find((v) => {
    return v.id == id;
  });
}

function startScan() {
  scanned.value = true;
  scan();
}

function scan() {
  logs.value.push('开始扫描');
  let count = 0;
  const roomMap: { [x: number]: { name: string, recorders: Array<{ id: string, autoRecord: boolean }> } } = {};
  recorders.value.forEach(async (server) => {
    try {
      const extraHeaders: { [key: string]: any } = {};
      server.extraHeaders?.forEach((h) => {
        extraHeaders[h.key] = h.value;
      });
      server.auth?.type === 'basic' ? (extraHeaders.Authorization = `Basic ${btoa(`${server.auth.username}:${server.auth.password}`)}`) : null;
      const controller = new Recorder(server.path, extraHeaders, server.id);
      logs.value.push(`拉取 ${server.name} 的房间信息 开始...`);
      const rooms = await controller.graphql<GRoomInfo>('q', 'query q{ r:rooms{o:objectId n:name rc:roomConfig{a:autoRecord i:roomId}}}', null);
      rooms.r.forEach(async (room) => {
        if (!roomMap[room.rc.i]) {
          roomMap[room.rc.i] = { name: room.n, recorders: [] };
        }
        roomMap[room.rc.i].recorders.push({
          id: server.id,
          autoRecord: room.rc.a,
        });
      });
      logs.value.push(`拉取 ${server.name} 的房间信息 完成`);
    } catch (error) {
      logs.value.push(`拉取 ${server.name} 的房间信息 出错`);
      console.error(error);
    }
    count++;
    progress.value = count / recorders.value.length * 90;
    // Is last one?
    if (count == recorders.value.length) {
      // do final job
      const dup = [];
      for (const roomId in roomMap) {
        if (Object.prototype.hasOwnProperty.call(roomMap, roomId)) {
          const element = roomMap[roomId];
          if (element.recorders.length > 1) {
            dup.push({ roomId, name: element.name, recorders: element.recorders });
          }
        }
      }
      result.value = dup;
      logs.value.push(`扫描完成`);
      progress.value = 100;
      showLog.value = false;
    }
  });
}


</script>
<style lang="scss" scoped>
.container {
  padding: 24px;

  .log {
    margin: 1em;

    p {
      margin: 0;
    }
  }
}
</style>
