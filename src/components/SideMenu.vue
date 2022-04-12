<template>
  <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed" show-trigger
    @collapse="collapsed = true" @expand="collapsed = false">
    <n-menu :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22" :options="menuOptions"
      :render-label="renderMenuLabel" :expand-icon="expandIcon" />
  </n-layout-sider>
</template>
<script setup lang="ts">
import { Component, h, inject, onMounted, Ref, ref, watch } from 'vue';
import type { MenuOption } from 'naive-ui';
import { NLayoutSider, NIcon, NMenu } from 'naive-ui';
import { HomeOutline, CaretDownOutline, ListOutline, FolderOpenOutline, SettingsOutline, DocumentTextOutline, InformationOutline } from '@vicons/ionicons5';
import { RouterLink } from 'vue-router';
import { RecorderController } from '../api';

const collapsed = ref(true);

const controller = inject<Ref<RecorderController>>('controller');

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}
const menuOptions = ref([
  {
    label: '首页',
    key: 'index',
    path: '/',
    icon: renderIcon(HomeOutline),
  },
  {
    label: '房间列表',
    key: 'rooms',
    path: '/rooms',
    disabled: true,
    icon: renderIcon(ListOutline),
  },
  {
    label: '文件管理器',
    key: 'filebrowser',
    path: '/filebrowser',
    disabled: true,
    icon: renderIcon(FolderOpenOutline),
  },
  {
    label: '设置',
    key: 'settings',
    path: '/settings',
    disabled: true,
    icon: renderIcon(SettingsOutline),
  },
  {
    label: '日志',
    key: 'log',
    path: '/log',
    disabled: true,
    icon: renderIcon(DocumentTextOutline),
  },
  {
    label: '关于',
    key: 'about',
    path: '/about',
    icon: renderIcon(InformationOutline),
  },
]);

const changeController = () => {
  if (controller!.value) {
    menuOptions.value[1].disabled = false;
    // menuOptions.value[2].disabled = false;
    menuOptions.value[3].disabled = false;
    // menuOptions.value[4].disabled = false;
  } else {
    menuOptions.value[1].disabled = true;
    // menuOptions.value[2].disabled = true;
    menuOptions.value[3].disabled = true;
    // menuOptions.value[4].disabled = true;
  }
};

watch([controller], changeController);

onMounted(() => {
  changeController();
});

function renderMenuLabel(option: MenuOption) {
  if (option.path && !option.disabled) {
    return h(
      RouterLink,
      {
        to: {
          path: option.path as string,
        },
      },
      { default: () => option.label },
    );
  }
  return option.label as string;
}
function expandIcon() {
  return h(NIcon, null, { default: () => h(CaretDownOutline) });
}
</script>
