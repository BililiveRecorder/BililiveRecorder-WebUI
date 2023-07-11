<template>
  <div class="home-container">
    <div style="text-align: center;">
      <n-h1 style="margin:0">mikufans录播姬 WebUI</n-h1>
      <p style="margin:0">
        <version-tag :version="selfversion" type="webui" />
      </p>
    </div>
    <div class="server-container">
      <n-list bordered style="width:100%;">
        <n-scrollbar v-if="recorders.length > 0" style="height: var(--max-vh);">
          <server-option v-for="server in recorders" :key="server.id" :server="server"
            :selected="currentRecorderId == server.id" @click="router.push(`/recorder/${server.id}`)"
            @delete="removeServer(server.id)" @modify="modifyServer(server)"></server-option>
        </n-scrollbar>
        <n-empty v-else style="height: 100%;justify-content: center;" description="点击下方按钮添加录播姬"></n-empty>
      </n-list>
    </div>
    <n-button @click="toggleNewServerModal">添加录播姬</n-button>
    <div class="file-operations">
      <n-popconfirm @positive-click="importServer">
        <template #trigger>
          <n-button quaternary type="tertiary">导入</n-button>
        </template>
        <div style="max-width: min(100vw, 200px); white-space: normal;">注意：所有的身份验证信息都是明文存储在浏览器中，请保护好您的设备。</div>
      </n-popconfirm>
      <n-popconfirm @positive-click="exportAllServer">
        <template #trigger>
          <n-button quaternary type="tertiary">导出</n-button>
        </template>
        <div style="max-width: min(100vw, 200px); white-space: normal;">注意：所有的身份验证信息都是明文存储在文件中，请妥善保存。</div>
      </n-popconfirm>
    </div>
    <n-modal v-model:show="showNewServerModal" preset="card" style="width: min(600px,100vw);"
      :title="serverField.id ? '编辑录播姬' : '添加录播姬'" v-on:after-leave="resetServer">
      <n-form>
        <n-form-item label="录播姬名称">
          <n-input v-model:value="serverField.name" :disabled="verifying" placeholder="录播姬名称"></n-input>
        </n-form-item>
        <n-form-item label="录播姬地址">
          <n-input v-model:value="serverField.path" :disabled="verifying" placeholder="http://localhost:8000/"></n-input>
        </n-form-item>
        <n-form-item label="图标">
          <n-input :disabled="verifying" v-model:value="serverField.iconPath" placeholder="http://"></n-input>
        </n-form-item>
        <n-form-item label="验证方式" label-placement="left">
          <n-radio-group v-model:value="serverField.authType" :disabled="verifying">
            <n-radio :value="'none'">无</n-radio>
            <n-radio :value="'basic'">Basic</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="serverField.authType === 'basic'" label="用户名">
          <n-input v-model:value="serverField.auth.username" :disabled="verifying" placeholder="用户名"></n-input>
        </n-form-item>
        <n-form-item v-if="serverField.authType === 'basic'" label="密码">
          <n-input v-model:value="serverField.auth.password" type="password" :disabled="verifying" placeholder="密码">
          </n-input>
        </n-form-item>
        <n-form-item label="额外请求头">
          <n-dynamic-input :disabled="verifying" v-model:value="serverField.extraHeaders" preset="pair"
            key-placeholder="Name" value-placeholder="Value"></n-dynamic-input>
        </n-form-item>
        <p>注意：所有的身份验证信息都是明文存储在浏览器中，验证信息不会被发送到网站，请保护好您自己的设备，不要中病毒，以免造成不必要的损失。</p>
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
import {
  useMessage, NH1, NEmpty, NButton, NScrollbar, NList, NModal, NForm, NFormItem, NInput, NDynamicInput,
  NRadio, NRadioGroup, NPopconfirm,
} from 'naive-ui';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { Recorder } from '../utils/api';
import ServerOption from '../components/ServerOption.vue';
import { recorderController, Server, verifyServer } from '../utils/RecorderController';
import { useRouter } from 'vue-router';
import VersionTag from '../components/VersionTag.vue';

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
  authType: 'none' as 'none' | 'basic',
  auth: {
    username: '',
    password: '',
  },
  iconPath: '',
});

function toggleNewServerModal() {
  showNewServerModal.value = !showNewServerModal.value;
}

async function saveAndVerify() {
  verifying.value = true;
  serverField.name = serverField.name.trim();
  if (serverField.name.length === 0) {
    message.error('录播姬名称不能为空');
    verifying.value = false;
    return;
  }
  if (serverField.path.length === 0) {
    message.error('录播姬地址不能为空');
    verifying.value = false;
    return;
  }
  if (!serverField.path.endsWith('/')) {
    serverField.path = serverField.path + '/';
  }
  try {
    const extraHeaders: { [key: string]: any } = {};
    serverField.extraHeaders.forEach((h) => {
      extraHeaders[h.key] = h.value;
    });
    serverField.authType === 'basic' && (extraHeaders.Authorization = `Basic ${btoa(`${serverField.auth.username}:${serverField.auth.password}`)}`);
    const res = await (new Recorder(serverField.path, extraHeaders, serverField.id)).getVersion();
    verifying.value = false;
    const newServer: any = {};
    newServer.id = serverField.id;
    newServer.path = serverField.path;
    newServer.name = serverField.name;
    newServer.iconPath = serverField.iconPath;
    if (serverField.extraHeaders.length > 0) {
      newServer.extraHeaders = serverField.extraHeaders.map((h) => {
        return {
          key: h.key,
          value: h.value,
        };
      });
    }
    newServer.auth = serverField.authType === 'basic' ? {
      type: 'basic',
      username: serverField.auth.username,
      password: serverField.auth.password,
    } : {
      type: 'none',
    };
    if (serverField.id) {
      controller.updateServer(serverField.id, newServer as Server);
    } else {
      newServer.id = generateRandomId();
      controller.addServer(newServer);
    }
    message.success('验证成功 v' + res.fullSemVer);
    controller.saveServers();
    showNewServerModal.value = false;
  } catch (error) {
    message.error('无法连接到 ' + serverField.path);
    verifying.value = false;
    return;
  }
}

function resetServer() {
  serverField.id = null;
  serverField.path = '';
  serverField.name = '';
  serverField.extraHeaders = [];
  serverField.authType = 'none';
  serverField.auth.username = '';
  serverField.auth.password = '';
  serverField.iconPath = '';
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
  serverField.extraHeaders = target.extraHeaders?.slice() || [];
  serverField.authType = target.auth?.type || 'none';
  serverField.auth = {
    username: target.auth?.type === 'basic' ? target.auth?.username : '',
    password: target.auth?.type === 'basic' ? target.auth?.password : '',
  };
  serverField.iconPath = target.iconPath || '';
  toggleNewServerModal();
}

function exportAllServer() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new File([recorderController.exportJSON()], 'ServerList.json', { type: 'application/json' }));
  a.target = '_blank';
  a.download = 'ServerList.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importServer() {
  const inputEl = document.createElement('input');
  inputEl.type = 'file';
  inputEl.accept = '.json,application/json,text/json';
  inputEl.addEventListener('change', (ev) => {
    if (inputEl.files && inputEl.files.length > 0) {
      inputEl.files[0].text().then((text) => {
        try {
          const servers = JSON.parse(text);
          if (!Array.isArray(servers)) {
            message.error('导入失败，文件不是json数组');
            return;
          }
          if (servers.length > 0) {
            message.info(`导入中，疑似有${servers.length}个录播姬`);
          } else {
            message.warning('导入失败，文件是空数组');
            return;
          }
          servers.forEach((e, i) => {
            try {
              verifyServer(e);
              e.id = generateRandomId();
              recorderController.addServer(e);
              message.success(`第 ${i} 个录播姬导入成功：${e.name}`);
            } catch (error: any) {
              message.error(`第 ${i} 个录播姬导入失败：${error.message || error.toString()}`);
            }
          });
          message.info('导入结束');
        } catch (error) {
          message.error('导入失败，文件不是合格的JSON');
        }
      });
    }
  });
  inputEl.click();
}


</script>

<style lang="scss" scoped>
.home-container {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .server-container {
    display: flex;
    width: min(400px, 100%);
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: 1vh 0;
    --max-vh: 45vh;
  }

  .file-operations {
    margin-top: 24px;
  }
}


@media (min-width: 768px) and (min-height: 768px) {
  .home-container {
    margin-top: 10vh;
  }
}
</style>
