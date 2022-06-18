<template>
  <div class="home-container">
    <div style="text-align: center;">
      <n-h1 style="margin:0">B站录播姬 WebUI</n-h1>
      <p style="margin:0">{{ selfversion }}</p>
    </div>
    <div class="server-container">
      <n-list bordered style="width:100%;">
        <n-scrollbar v-if="recorders.length > 0" style="height: var(--max-vh);">
          <server-option v-for="server in recorders" :key="server.id" :server="server"
            :selected="currentRecorderId == server.id" @click="router.push(`/recorder/${server.id}`)"
            @delete="removeServer(server.id)" @modify="modifyServer(server)"></server-option>
        </n-scrollbar>
        <n-empty v-else style="height: 100%;justify-content: center;" description="点击下方按钮添加服务器"></n-empty>
      </n-list>
    </div>
    <n-button @click="toggleNewServerModal">添加服务器</n-button>
    <n-modal v-model:show="showNewServerModal" preset="card" style="width: min(600px,100vw);"
      :title="serverField.id ? '添加服务器' : '编辑服务器'" v-on:after-leave="resetServer">
      <n-form>
        <n-form-item label="服务器名称">
          <n-input v-model:value="serverField.name" :disabled="verifying" placeholder="服务器名称"></n-input>
        </n-form-item>
        <n-form-item label="服务器地址">
          <n-input v-model:value="serverField.path" :disabled="verifying" placeholder="http://localhost:8000"></n-input>
        </n-form-item>
        <n-form-item label="额外请求头">
          <n-dynamic-input :disabled="verifying" v-model:value="serverField.extraHeaders" preset="pair"
            key-placeholder="Name" value-placeholder="Value"></n-dynamic-input>
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex; justify-content:flex-end">
          <n-button :loading="verifying" @click="saveAndVerify">验证并保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
<script setup lang="ts">
import { VERSION } from '../const';
import { useMessage, NH1, NEmpty, NButton, NScrollbar, NList, NModal, NForm, NFormItem, NInput, NDynamicInput } from 'naive-ui';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { Recorder } from '../utils/api';
import ServerOption from '../components/ServerOption.vue';
import { Server } from '../server';
import { recorderController } from '../utils/RecorderController';
import { useRouter } from 'vue-router';

const selfversion = VERSION;
const message = useMessage();
const router = useRouter();

const controller = recorderController;

const recorders = ref(controller.listServers());

const updateRecordersList = () => {
  recorders.value = controller.listServers();
};

onMounted(() => {
  recorders.value = controller.listServers();
  controller.addEventListener('recorders-list-update', updateRecordersList);
});
onUnmounted(() => {
  controller.removeEventListener('recorders-list-update', updateRecordersList);
});

const currentRecorderId = ref(controller.recorder?.meta.id);

const updateCurrentRecorder = () => {
  currentRecorderId.value = controller.recorder?.meta.id;
};

onMounted(() => {
  currentRecorderId.value = controller.recorder?.meta.id;
  controller.addEventListener('recorder-change', updateCurrentRecorder);
});
onUnmounted(() => {
  controller.removeEventListener('recorder-change', updateCurrentRecorder);
});


function generateRandomId() {
  return Math.random().toString(36).substring(2, 8);
}

const showNewServerModal = ref(false);
const verifying = ref(false);

const serverField = reactive({
  id: null as string | null,
  path: '',
  name: '',
  extraHeaders: [] as { key: string; value: string }[],
});

function toggleNewServerModal() {
  showNewServerModal.value = !showNewServerModal.value;
}

async function saveAndVerify() {
  verifying.value = true;
  serverField.name = serverField.name.trim();
  if (serverField.name.length === 0) {
    message.error('服务器名称不能为空');
    verifying.value = false;
    return;
  }
  if (serverField.path.length === 0) {
    message.error('服务器地址不能为空');
    verifying.value = false;
    return;
  }
  try {
    const extraHeaders: { [key: string]: any } = {};
    serverField.extraHeaders.forEach((h) => {
      extraHeaders[h.key] = h.value;
    });
    const res = await (new Recorder(serverField.path, extraHeaders, serverField.id)).getVersion();
    verifying.value = false;
    const newServer: any = {};
    newServer.id = serverField.id;
    newServer.path = serverField.path;
    newServer.name = serverField.name;
    newServer.extraHeaders = serverField.extraHeaders.slice();
    if (serverField.id) {
      controller.updateServer(serverField.id, newServer);
    } else {
      newServer.id = generateRandomId();
      controller.addServer(newServer);
    }
    message.success('验证成功 v' + res.fullSemVer);
    controller.saveServers();
    showNewServerModal.value = false;
  } catch (error) {
    message.error('无法连接到 ');
    verifying.value = false;
    return;
  }
}

function resetServer() {
  serverField.id = null;
  serverField.path = '';
  serverField.name = '';
  serverField.extraHeaders = [];
}

function removeServer(id: string) {
  if (controller.recorder?.meta?.id === id) {
    controller.resetRecorder();
  }
  controller.removeServer(id);
}

function modifyServer(target: Server) {
  serverField.id = target.id;
  serverField.path = target.path;
  serverField.name = target.name;
  serverField.extraHeaders = target.extraHeaders.slice();
  toggleNewServerModal();
}
</script>

<style lang="sass" scoped>

.home-container
  padding: 24px
  display: flex
  align-items: center
  justify-content: center
  flex-direction: column
  .server-container
    display: flex
    width: min(400px,100%)
    align-items: center
    justify-content: center
    flex-direction: column
    margin: 1vh 0
    --max-vh: 45vh

@media (min-width: 768px) and (min-height: 768px)
  .home-container
    margin-top: 10vh
</style>
