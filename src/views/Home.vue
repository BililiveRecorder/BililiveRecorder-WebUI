<template>
  <div class="home-container">
    <div style="text-align: center;">
      <n-h1 style="margin:0">录播姬 WebUI</n-h1>
      <p style="margin:0">{{ selfversion }}</p>
    </div>
    <div class="server-container">
      <n-list bordered style="width:100%;">
        <n-scrollbar v-if="servers.length > 0" style="height: var(--max-vh);">
          <server-option
            v-for="server in servers"
            :key="server.id"
            :server="server"
            :selected="controller?.extra.id == server.id"
            @click="setServer(server)"
            @delete="removeServer(server.id)"
          ></server-option>
        </n-scrollbar>
        <n-empty v-else style="height: 100%;justify-content: center;" description="点击下方按钮添加服务器"></n-empty>
      </n-list>
    </div>
    <n-button @click="toggleNewServerModal">添加服务器</n-button>
    <n-modal
      v-model:show="showNewServerModal"
      preset="card"
      style="width: min(600px,100vw);"
      :title="server.id ? '添加服务器' : '编辑服务器'"
      @close="resetServer"
    >
      <n-form>
        <n-form-item label="服务器名称">
          <n-input v-model:value="server.name" :disabled="verifying" placeholder="服务器名称"></n-input>
        </n-form-item>
        <n-form-item label="服务器地址">
          <n-input
            v-model:value="server.path"
            :disabled="verifying"
            placeholder="http://localhost:8000"
          ></n-input>
        </n-form-item>
        <n-form-item label="额外请求头">
          <n-dynamic-input
            :disabled="verifying"
            v-model="server.extraHeaders"
            preset="pair"
            key-placeholder="Name"
            value-placeholder="Value"
          ></n-dynamic-input>
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
import { useMessage, NH1, NEmpty, NButton, NScrollbar, NList, NModal, NForm, NFormItem, NInput, NDynamicInput } from 'naive-ui';
import { inject, onMounted, reactive, Ref, ref } from 'vue';
import { RecorderController } from '../api';
import ServerOption from '../components/ServerOption.vue';

interface kvpairs {
  key: string;
  value: string;
}

interface Server {
  id: string;
  path: string;
  name: string;
  extraHeaders: kvpairs[];
}

const selfversion = window.__WebUI.version;

const message = useMessage();

const controller = inject<Ref<RecorderController>>('controller');
const changeHost: (host: string, headers?: { [key: string]: string }, extra?: any) => void = inject('changeHost') as any;
const resetHost: () => void = inject('resetHost') as any;

const servers = ref([] as Server[]);

function loadServers() {
  if (window.localStorage) {
    const data = window.localStorage.getItem('servers');
    if (data) {
      try {
        const parsed = JSON.parse(data) as Server[];
        parsed.forEach((s) => {
          if (typeof s.id === 'undefined') {
            s.id = `${s.path}-${s.name}`;
          }
          if (typeof s.path !== 'string') {
            throw new Error('path is not a string');
          }
          if (typeof s.name !== 'string') {
            throw new Error('name is not a string');
          }
          if (!Array.isArray(s.extraHeaders)) {
            throw new Error('extraHeaders is not an array');
          }
          s.extraHeaders.forEach((h) => {
            if (typeof h.key !== 'string') {
              throw new Error('extraHeaders.name is not a string');
            }
            if (typeof h.value !== 'string') {
              throw new Error('extraHeaders.value is not a string');
            }
          });
        });
        servers.value = parsed;
        return;
      } catch (error) {
        console.error(error);
        message.error('载入服务器列表失败');
      }
    }
    servers.value = [{
      id: document.location.hostname,
      path: document.location.origin,
      name: document.location.hostname,
      extraHeaders: [],
    }];
    saveServers();
  } else {
    message.info('您的浏览器不支持本地存储，请更换浏览器');
  }
}

function saveServers() {
  if (window.localStorage) {
    // copy
    const data = [];
    servers.value.forEach((s) => {
      data.push({
        path: s.path,
        name: s.name,
        extraHeaders: s.extraHeaders.slice(),
      });
    });

    window.localStorage.setItem('servers', JSON.stringify(servers.value));
  } else {
    message.info('您的浏览器不支持本地存储，请更换浏览器');
  }
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

function generateRandomId() {
  return Math.random().toString(36).substring(2, 8);
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
    await (new RecorderController(server.path, extraHeaders)).getVersion();
    verifying.value = false;
    const newServer: any = {};
    newServer.id = generateRandomId;
    newServer.path = server.path;
    newServer.name = server.name;
    newServer.extraHeaders = server.extraHeaders.slice();
    servers.value.push(newServer);
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

function setServer(server: Server) {
  const headers: any = {};
  server.extraHeaders.forEach((h) => {
    headers[h.key] = h.value;
  });
  changeHost(server.path, headers, server);
};


onMounted(() => {
  loadServers();
});

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
