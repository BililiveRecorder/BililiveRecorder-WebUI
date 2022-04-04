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

const controller = ref<RecorderController>(new RecorderController(location.origin));

provide('controller', controller);
provide('changeHost', (host: string) => {
  controller.value = new RecorderController(host);
});

</script>
