<template>
  <global-provider>
    <n-layout :style="{ height: vh100 + 'px' }">
      <top-bar />
      <n-layout position="absolute" style="top: 64px; bottom: 64px" has-sider>
        <side-menu></side-menu>
        <n-layout content-style="padding: 24px;height: 100%;" :native-scrollbar="false">
          <router-view></router-view>
        </n-layout>
      </n-layout>
      <n-layout-footer
        position="absolute"
        style="height: 64px;display: flex; justify-content: flex-start; align-items: center"
        bordered
      >Copyright (C) 2022 Shugen002. All rights reserved.(这人还在想用什么协议，寄！)</n-layout-footer>
    </n-layout>
  </global-provider>
</template>

<script setup lang="ts">
import { NLayout, NLayoutFooter } from 'naive-ui';
import GlobalProvider from './components/GlobalProvider.vue';
import SideMenu from './components/SideMenu.vue';
import TopBar from './components/TopBar.vue';

const vh100 = window.innerHeight;
</script>

<style>
</style>
