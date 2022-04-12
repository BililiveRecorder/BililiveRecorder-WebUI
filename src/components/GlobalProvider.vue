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
import { NConfigProvider, NLoadingBarProvider, NDialogProvider, NMessageProvider, darkTheme, useMessage } from 'naive-ui';
import { provide, ref } from 'vue';
import { useRouter } from 'vue-router';

const controller = ref<RecorderController | null>(null);
const router = useRouter();

provide('controller', controller);
provide('changeHost', (host: string, headers?: { [key: string]: string }, extra?: any) => {
  controller.value = new RecorderController(host, headers, extra);
});
provide('resetHost', () => {
  controller.value = null;
});

router.beforeEach((to, from, next) => {
  if (to.meta.requireController) {
    if (controller.value) {
      next();
    } else {
      next('/');
    }
  } else {
    next();
  }
});

</script>
