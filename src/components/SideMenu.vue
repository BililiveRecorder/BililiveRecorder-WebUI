<template>
  <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed" show-trigger
    @collapse="collapsed = true" @expand="collapsed = false">
    <n-menu :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22" :options="menuOptions"
      :render-label="renderMenuLabel" :expand-icon="expandIcon" :value="current" />
  </n-layout-sider>
</template>
<script setup lang="ts">
import { Component, h, onMounted, onUnmounted, ref } from 'vue';
import { NLayoutSider, NIcon, NMenu, MenuOption } from 'naive-ui';
import { HomeOutline, CaretDownOutline, ListOutline, SpeedometerOutline, FolderOpenOutline, SettingsOutline, DocumentTextOutline, InformationOutline, LayersOutline } from '@vicons/ionicons5';
import { RouterLink, useRouter } from 'vue-router';
import { EMBEDED_BUILD } from '../const';
import { recorderController } from '../utils/RecorderController';

const router = useRouter();
const collapsed = ref(true);

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

function disconnectedMenu(): MenuOption[] {
  const result: MenuOption[] = [
    {
      label: '首页',
      key: 'index',
      path: '/',
      disabled: EMBEDED_BUILD,
      icon: renderIcon(HomeOutline),
    },
    {
      label: '关于',
      key: 'about',
      path: '/about',
      icon: renderIcon(InformationOutline),
      disabled: false,
    },
  ];
  const recorders = recorderController.listServers();
  if (recorders.length > 0) {
    result.push({
      key: 'divider',
      type: 'divider',
    });
    recorders.forEach((r) => {
      result.push({
        label: r.name,
        key: r.id,
        path: `/recorder/${r.id}`,
        icon: renderIcon(LayersOutline),
        disabled: false,
      });
    });
  }
  return result;
}

function connectedMenu(id: string): MenuOption[] {
  const result: MenuOption[] = [
    {
      label: '首页',
      key: 'index',
      path: '/',
      icon: renderIcon(HomeOutline),
    },
    {
      label: '关于',
      key: 'about',
      path: '/about',
      icon: renderIcon(InformationOutline),
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      label: recorderController.recorder?.meta.name ?? '未知',
      key: 'recorder',
      icon: renderIcon(LayersOutline),
      disabled: true,
    },
    {
      label: '面板',
      key: 'dashboard',
      path: `/recorder/${id}`,
      icon: renderIcon(SpeedometerOutline),
    },
    {
      label: '房间列表',
      key: 'rooms',
      path: `/recorder/${id}/rooms`,
      icon: renderIcon(ListOutline),
    },
    {
      label: '文件管理器',
      key: 'files',
      path: `/recorder/${id}/filebrowser`,
      icon: renderIcon(FolderOpenOutline),
      disabled: true,
    },
    {
      label: '设置',
      key: 'settings',
      path: `/recorder/${id}/settings`,
      icon: renderIcon(SettingsOutline),
    },
    {
      label: '日志',
      key: 'logs',
      path: `/recorder/${id}/logs`,
      icon: renderIcon(DocumentTextOutline),
      disabled: true,
    },
  ];

  const recorders = recorderController.listServers();
  if (recorders.length > 1) {
    result.push({
      key: 'divider',
      type: 'divider',
    });
    recorders.forEach((r) => {
      result.push({
        label: r.name,
        key: r.id,
        path: `/recorder/${r.id}`,
        icon: renderIcon(LayersOutline),
        disabled: false,
      });
    });
  }
  return result;
}

const menuOptions = ref<MenuOption[]>(disconnectedMenu());

const onRecorderChange = () => {
  if (recorderController.recorder != null) {
    // @ts-expect-error ts(2589)
    menuOptions.value = connectedMenu(recorderController.recorder.meta.id);
  } else {
    menuOptions.value = disconnectedMenu();
  }
};

const current = ref('');

router.afterEach((to, from) => {
  current.value = to.meta.key as string;
});

onMounted(() => {
  onRecorderChange();
  recorderController.addEventListener('recorder-change', onRecorderChange);
  recorderController.addEventListener('recorders-list-update', onRecorderChange);
});
onUnmounted(() => {
  recorderController.removeEventListener('recorder-change', onRecorderChange);
  recorderController.removeEventListener('recorders-list-update', onRecorderChange);
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
