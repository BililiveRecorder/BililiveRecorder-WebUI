<template>
  <n-config-provider :theme="darkTheme" :locale="zhCN" :date-locale="dateZhCN">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <slot></slot>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import { NConfigProvider, NLoadingBarProvider, NDialogProvider, darkTheme } from 'naive-ui';
import { zhCN, dateZhCN } from 'naive-ui';
</script>
