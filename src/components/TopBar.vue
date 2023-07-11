<template>
  <n-layout-header style="height: 64px;display: flex;align-items: center;justify-content: space-between" bordered>
    <div style="display: flex; align-items: center">
      <img src="/favicon.svg" style="height: 36px;margin-left: 12px;" />
      <n-h3 style="margin: 0 24px">
        mikufans录播姬
      </n-h3>
      <n-button @click="switchTheme">
        <n-icon :component="ContrastOutline" />
      </n-button>
    </div>
  </n-layout-header>
</template>
<script lang="ts">
import { inject, Ref } from 'vue';
import { NLayoutHeader, NH3, NButton, NIcon } from 'naive-ui';
import { ContrastOutline } from '@vicons/ionicons5';

</script>
<script setup lang="ts">

const switchThemeInject = inject<Ref<Function>>('switchTheme');
function switchTheme() {
  if (switchThemeInject) {
    switchThemeInject.value();
  }
}
</script>
