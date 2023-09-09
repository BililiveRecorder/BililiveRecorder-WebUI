<template>
  <global-provider>
    <n-layout :style="{ height: vh100 + 'px' }">
      <top-bar />
      <n-layout position="absolute" style="top:64px" has-sider>
        <side-menu></side-menu>
        <n-layout content-style="height: 100%;" id="app-layout" :style="{}">
          <n-scrollbar :class="{ 'block-scrollbar': blockScrollbar }" id="content-scrollbar">
            <router-view></router-view>
          </n-scrollbar>
        </n-layout>
      </n-layout>
    </n-layout>
    <UpdateNotifier />
    <div class="background"></div>
  </global-provider>
</template>

<script setup lang="ts">
import { NLayout, NScrollbar } from 'naive-ui';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import GlobalProvider from './components/GlobalProvider.vue';
import SideMenu from './components/SideMenu.vue';
import TopBar from './components/TopBar.vue';
import UpdateNotifier from './components/UpdateNotifier.vue';

const router = useRouter();
const blockScrollbar = ref(false);
router.afterEach((to) => {
  blockScrollbar.value = to.meta.blockGlobalScrollBar as boolean || false;
});

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
<style lang="scss">
.background {
  pointer-events: none;
  position: absolute;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  background-size: 33%;
  background-repeat: no-repeat;
  background-position-x: 100%;
  background-position-y: 64px;
  opacity: 15%;
}

@media (max-width: 768px) {
  .background {
    background-size: 66%;
  }
}
</style>
<style>
.n-scrollbar.block-scrollbar>.n-scrollbar-container>.n-scrollbar-content {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
