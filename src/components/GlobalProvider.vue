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
<script lang="ts">
import { provide, ref, onMounted } from 'vue';
import { NConfigProvider, NLoadingBarProvider, NDialogProvider, NNotificationProvider, NMessageProvider, darkTheme, lightTheme } from 'naive-ui';
import { zhCN, dateZhCN } from 'naive-ui';
import { EMBEDDED_BUILD, STORAGE_THEME } from '../const';
import { useRouter } from 'vue-router';
import { recorderController } from '../utils/RecorderController';

</script>
<script setup lang="ts">
const router = useRouter();
let currentTheme = 0;
const themeMap = [darkTheme, lightTheme];
const theme = ref(darkTheme);

onMounted(() => {
  const storageValue = localStorage.getItem(STORAGE_THEME);
  if (storageValue !== null) {
    currentTheme = parseInt(storageValue);
  }
  currentTheme = isNaN(currentTheme) ? 0 : currentTheme % 2;
  theme.value = themeMap[currentTheme];
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

function updateTitle(...extra: string[]) {
  const currentRoute = router.currentRoute.value;
  let titleElement = ['mikufans录播姬'];
  if (currentRoute.meta.requireController && recorderController.recorder && !EMBEDDED_BUILD) {
    titleElement.unshift(recorderController.recorder.meta.name || '？？？？');
  }
  if (currentRoute.meta.title) {
    const t = typeof currentRoute.meta.title === 'function' ? currentRoute.meta.title() : currentRoute.meta.title;
    if (t) {
      titleElement.unshift(t);
    }
  }
  if (extra.length > 0) {
    titleElement = extra.concat(titleElement);
  }
  document.title = titleElement.join(' - ');
}

provide('updateTitle', updateTitle);

router.afterEach(function (to, from, failure) {
  if (!failure) {
    updateTitle();
  }
});

</script>
