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
import { NConfigProvider, NLoadingBarProvider, NDialogProvider, darkTheme } from 'naive-ui';
</script>
