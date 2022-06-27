<template>
  <global-provider>
    <n-layout :style="{ height: vh100 + 'px' }">
      <top-bar />
      <n-layout position="absolute" style="top:64px" has-sider>
        <side-menu></side-menu>
        <n-layout content-style="height: 100%;" id="app-layout" :native-scrollbar="true" :style="{}">
          <n-scrollbar>
            <router-view></router-view>
          </n-scrollbar>
        </n-layout>
      </n-layout>
    </n-layout>
  </global-provider>
</template>

<script setup lang="ts">
import { NLayout, NScrollbar } from 'naive-ui';
import { onMounted, onUnmounted, ref } from 'vue';
import GlobalProvider from './components/GlobalProvider.vue';
import SideMenu from './components/SideMenu.vue';
import TopBar from './components/TopBar.vue';

const vh100 = ref(window.innerHeight);
function resize() {
  vh100.value = window.innerHeight;
}
onMounted(() => {
  window.addEventListener('resize', resize);
});
onUnmounted(() => {
  window.removeEventListener('resize', resize);
});
</script>
