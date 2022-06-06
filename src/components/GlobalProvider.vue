<template>
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <slot></slot>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import { RecorderController } from '../api';
import { NConfigProvider, NLoadingBarProvider, NDialogProvider, darkTheme, useMessage } from 'naive-ui';
import { onMounted, provide, ref } from 'vue';
import { useRouter } from 'vue-router';
import { EMBEDED_BUILD } from '../const';
import { Server } from '../server';

const STORAGE_KEY_SERVERS = 'brec.servers';
const STORAGE_KEY_SELECTED_SERVER = 'brec.selectedServer';

const message = useMessage();
const controller = ref<RecorderController | null>(null);
const router = useRouter();
const servers = ref([] as Server[]);

function changeHost(server: Server) {
  const headers: any = {};
  server.extraHeaders.forEach((h) => {
    headers[h.key] = h.value;
  });
  controller.value = new RecorderController(server.path, headers, server);

  if (!EMBEDED_BUILD) {
    localStorage.setItem(STORAGE_KEY_SELECTED_SERVER, server.id);
  }
}

function resetHost() {
  controller.value = null;
}

provide('controller', controller);
provide('changeHost', changeHost);
provide('resetHost', resetHost);
provide('servers', servers);
provide('saveServers', saveServers);

router.beforeEach((to, from) => {
  if (EMBEDED_BUILD && to.path === '/') {
    return '/rooms';
  }

  if (!EMBEDED_BUILD && to.meta.requireController) {
    if (controller.value) {
      document.title = (to?.meta.title ? `${to.meta.title}@${controller.value.extra?.name} - ` : '') + 'B站录播姬';
      return true;
    } else {
      return '/';
    }
  }

  document.title = (to?.meta.title ? `${to.meta.title} - ` : '') + 'B站录播姬';
  return true;
});

function loadServers() {
  if (EMBEDED_BUILD) {
    return;
  }

  if (window.localStorage) {
    const data = window.localStorage.getItem(STORAGE_KEY_SERVERS);
    if (data) {
      try {
        const parsed = JSON.parse(data) as Server[];
        parsed.forEach((s) => {
          if (typeof s.id === 'undefined') {
            s.id = generateRandomId();
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

        const selectedId = window.localStorage.getItem(STORAGE_KEY_SELECTED_SERVER);
        if (selectedId) {
          const searchResult = parsed.find((s) => s.id == selectedId);
          if (searchResult) {
            changeHost(searchResult);
          }
        }

        return;
      } catch (error) {
        console.error(error);
        message.error('载入服务器列表失败');
      }
    }
    servers.value = [];
    saveServers();
  } else {
    message.info('您的浏览器不支持本地存储，请更换浏览器');
  }
}

function saveServers() {
  if (EMBEDED_BUILD) {
    return;
  }

  if (window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY_SERVERS, JSON.stringify(servers.value));
  } else {
    message.info('您的浏览器不支持本地存储，请更换浏览器');
  }
}

function generateRandomId() {
  return Math.random().toString(36).substring(2, 8);
}

onMounted(() => {
  if (EMBEDED_BUILD) {
    controller.value = new RecorderController(new URL('/', window.location.href).toString());
  } else {
    loadServers();
  }
});

</script>
