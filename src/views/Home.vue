<template>
  <div class="home-container">
    <div style="text-align: center;">
      <n-h1 style="margin:0">B站录播姬 WebUI</n-h1>
      <p style="margin:0">{{ selfversion }}</p>
    </div>
    <div class="server-container">
      <n-list bordered style="width:100%;">
        <n-scrollbar v-if="servers.length > 0" style="height: var(--max-vh);">
          <server-option v-for="server in servers" :key="server.id" :server="server"
            :selected="controller?.extra.id == server.id" @click="changeHost(server)" @delete="removeServer(server.id)"
            @modify="modifyServer(server)"></server-option>
        </n-scrollbar>
        <n-empty v-else style="height: 100%;justify-content: center;" description="点击下方按钮添加服务器"></n-empty>
      </n-list>
    </div>
    <n-button @click="toggleNewServerModal">添加服务器</n-button>
    <n-modal v-model:show="showNewServerModal" preset="card" style="width: min(600px,100vw);"
      :title="server.id ? '添加服务器' : '编辑服务器'" @close="resetServer">
      <n-form>
        <n-form-item label="服务器名称">
          <n-input v-model:value="server.name" :disabled="verifying" placeholder="服务器名称"></n-input>
        </n-form-item>
        <n-form-item label="服务器地址">
          <n-input v-model:value="server.path" :disabled="verifying" placeholder="http://localhost:8000"></n-input>
        </n-form-item>
        <n-form-item label="额外请求头">
          <n-dynamic-input :disabled="verifying" v-model="server.extraHeaders" preset="pair" key-placeholder="Name"
            value-placeholder="Value"></n-dynamic-input>
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
import { inject, reactive, Ref, ref } from 'vue';
import { RecorderController } from '../api';
import ServerOption from '../components/ServerOption.vue';
import { Server } from '../server';

const selfversion = VERSION;
const message = useMessage();

const controller = inject<Ref<RecorderController>>('controller');
const changeHost = inject('changeHost') as (server: Server) => void;
const resetHost = inject('resetHost') as () => void;
const saveServers = inject('saveServers') as () => void;
const servers = inject('servers') as Ref<Server[]>;

function generateRandomId() {
  return Math.random().toString(36).substring(2, 8);
}

const showNewServerModal = ref(false);
const verifying = ref(false);

const server = reactive({
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
  server.name = server.name.trim();
  if (server.name.length === 0) {
    message.error('服务器名称不能为空');
    verifying.value = false;
    return;
  }
  if (server.path.length === 0) {
    message.error('服务器地址不能为空');
    verifying.value = false;
    return;
  }
  try {
    const extraHeaders: { [key: string]: any } = {};
    server.extraHeaders.forEach((h) => {
      extraHeaders[h.key] = h.value;
    });
    const res = await (new RecorderController(server.path, extraHeaders)).getVersion();
    verifying.value = false;
    const newServer: any = {};
    newServer.path = server.path;
    newServer.name = server.name;
    newServer.extraHeaders = server.extraHeaders.slice();
    if (server.id) {
      newServer.id = server.id;
      servers.value = servers.value.map((s) => {
        if (s.id === server.id) {
          return newServer;
        }
        return s;
      });
    } else {
      newServer.id = generateRandomId();
      servers.value.push(newServer);
    }
    message.success('验证成功 v' + res.fullSemVer);
    saveServers();
    showNewServerModal.value = false;
  } catch (error) {
    message.error('无法连接到服务器');
    verifying.value = false;
    return;
  }
}

function resetServer() {
  server.id = null;
  server.path = '';
  server.name = '';
  server.extraHeaders = [];
}

function removeServer(id: string) {
  if (controller?.value?.extra?.id === id) {
    resetHost();
  }
  servers.value = servers.value.filter((s) => s.id !== id);
  saveServers();
}

function modifyServer(target: Server) {
  server.id = target.id;
  server.path = target.path;
  server.name = target.name;
  server.extraHeaders = target.extraHeaders.slice();
  toggleNewServerModal();
}
</script>

<style lang="sass" scoped>

.home-container
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
