<template>
  <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed" show-trigger
    @collapse="collapsed = true" @expand="collapsed = false" :native-scrollbar="false">
    <n-menu style="height:100%" :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22"
      :options="(menuOptions as any)" :render-label="renderMenuLabel" :expand-icon="expandIcon" :value="current" />
  </n-layout-sider>
</template>
<script setup lang="ts">
import { Component, h, onMounted, onUnmounted, ref } from 'vue';
import { NLayoutSider, NIcon, NMenu, MenuOption, MenuGroupOption } from 'naive-ui';
import { HomeOutline, CaretDownOutline, ListOutline, SpeedometerOutline, FolderOpenOutline, SettingsOutline, DocumentTextOutline, InformationOutline } from '@vicons/ionicons5';
import { RouterLink, useRouter } from 'vue-router';
import { EMBEDED_BUILD } from '../const';
import { recorderController } from '../utils/RecorderController';
import { generateServerIcon } from '../utils/ServerIconGenerator';

const router = useRouter();
const collapsed = ref(true);

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

function disconnectedMenu(): Array<MenuOption | MenuGroupOption> {
  const result: Array<MenuOption | MenuGroupOption> = [
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
        icon: renderIcon(generateServerIcon(r)),
        disabled: false,
      });
    });
  }
  return result;
}

function connectedMenu(id: string): Array<MenuOption | MenuGroupOption> {
  const result: Array<MenuOption | MenuGroupOption> = [
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

  ];

  const recorders = recorderController.listServers();

  recorders.forEach((r) => {
    result.push({
      label: r.name,
      key: r.id,
      path: `/recorder/${r.id}`,
      icon: renderIcon(generateServerIcon(r)),
      disabled: false,
    });
    if (r.id === id) {
      [{
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
        path: `/recorder/${id}/files`,
        icon: renderIcon(FolderOpenOutline),
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
      }].forEach((item) => {
        result.push(item);
      });
    }
  });

  return result;
}

function embededMenu(): Array<MenuOption | MenuGroupOption> {
  return [{
    label: '面板',
    key: 'dashboard',
    path: `/recorder/local`,
    icon: renderIcon(SpeedometerOutline),
  },
  {
    label: '房间列表',
    key: 'rooms',
    path: `/recorder/local/rooms`,
    icon: renderIcon(ListOutline),
  },
  {
    label: '文件管理器',
    key: 'files',
    path: `/recorder/local/files`,
    icon: renderIcon(FolderOpenOutline),
  },
  {
    label: '设置',
    key: 'settings',
    path: `/recorder/local/settings`,
    icon: renderIcon(SettingsOutline),
  },
  {
    label: '日志',
    key: 'logs',
    path: `/recorder/local/logs`,
    icon: renderIcon(DocumentTextOutline),
    disabled: true,
  },
  {
    label: '关于',
    key: 'about',
    path: '/about',
    icon: renderIcon(InformationOutline),
  }];
}

const menuOptions = ref<Array<MenuOption | MenuGroupOption>>(EMBEDED_BUILD ? embededMenu() : disconnectedMenu());

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

if (!EMBEDED_BUILD) {
  onMounted(() => {
    onRecorderChange();
    recorderController.addEventListener('recorder-change', onRecorderChange);
    recorderController.addEventListener('recorders-list-update', onRecorderChange);
  });
  onUnmounted(() => {
    recorderController.removeEventListener('recorder-change', onRecorderChange);
    recorderController.removeEventListener('recorders-list-update', onRecorderChange);
  });
}


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
