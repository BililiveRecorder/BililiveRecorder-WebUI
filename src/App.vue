<template>
  <global-provider>
    <n-layout style="height: 100vh">
      <n-layout-header style="height: 64px; padding: 24px" bordered>录播姬</n-layout-header>
      <n-layout position="absolute" style="top: 64px; bottom: 64px" has-sider>
        <side-menu></side-menu>
        <n-layout content-style="padding: 24px;" :native-scrollbar="false">
          <router-view></router-view>
        </n-layout>
      </n-layout>
      <n-layout-footer
        position="absolute"
        style="height: 64px; padding: 24px"
        bordered
      >CopyrightHere</n-layout-footer>
    </n-layout>
  </global-provider>
</template>

<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutFooter } from 'naive-ui';
import GlobalProvider from './components/GlobalProvider.vue';
import SideMenu from './components/SideMenu.vue';
</script>

<style>
</style>
