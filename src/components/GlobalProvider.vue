<template>
  <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN" inline-theme-disabled abstract>
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-message-provider>
          <n-notification-provider>
            <slot></slot>
          </n-notification-provider>
        </n-message-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import { provide, ref, onMounted } from 'vue';
import { NConfigProvider, NLoadingBarProvider, NDialogProvider, NNotificationProvider, NMessageProvider, darkTheme, lightTheme } from 'naive-ui';
import { zhCN, dateZhCN } from 'naive-ui';
import { STORAGE_THEME } from '../const';

let currentTheme = 0;
const themeMap = [darkTheme, lightTheme];
const theme = ref(darkTheme);

onMounted(()=>{
  const storageValue= localStorage.getItem(STORAGE_THEME);
  if (storageValue !== null) {
    currentTheme = parseInt(storageValue);
  }
  currentTheme = isNaN(currentTheme) ? 0 : currentTheme % 2;
});

provide('switchTheme', {
  value: () => {
    currentTheme++;
    currentTheme %= 2;
    theme.value = themeMap[currentTheme];
    saveTheme();
  },
});
function saveTheme() {
  try {
    localStorage.setItem(STORAGE_THEME, currentTheme.toString());
  } catch (e) {
    // ignore
  }
}

</script>
