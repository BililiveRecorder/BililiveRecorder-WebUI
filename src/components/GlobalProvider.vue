<template>
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-message-provider>
          <slot></slot>
        </n-message-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import { RecorderController } from '../api';
import { NConfigProvider, NLoadingBarProvider, NDialogProvider, NMessageProvider, darkTheme } from 'naive-ui';
import { provide, ref } from 'vue';
import { useRouter } from 'vue-router';
import { EMBEDED_BUILD } from '../const';

const controller = ref<RecorderController | null>(null);
const router = useRouter();

provide('controller', controller);
provide('changeHost', (host: string, headers?: { [key: string]: string }, extra?: any) => {
  controller.value = new RecorderController(host, headers, extra);
});
provide('resetHost', () => {
  controller.value = null;
});

if (EMBEDED_BUILD) {
  controller.value = new RecorderController(new URL('/', window.location.href).toString());
}

router.beforeEach((to, from) => {
  if (EMBEDED_BUILD && to.path === '/') {
    return '/rooms';
  }

  if (!EMBEDED_BUILD && to.meta.requireController) {
    if (controller.value) {
      document.title = (to?.meta.title ? `${to.meta.title}@${controller.value.extra?.name} - ` : '') + '录播姬';
      return true;
    } else {
      return '/';
    }
  }

  document.title = (to?.meta.title ? `${to.meta.title} - ` : '') + '录播姬';
  return true;
});
</script>
