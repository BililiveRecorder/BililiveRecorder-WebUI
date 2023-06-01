<template>
  <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed" show-trigger
    @collapse="collapsed = true" @expand="collapsed = false" :native-scrollbar="false">
    <n-menu style="height:100%" :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22"
      :options="(menuOptions as any)" :render-label="renderMenuLabel" :expand-icon="expandIcon" :value="current" />
  </n-layout-sider>
</template>
<script lang="ts">
import { Component, h, onMounted, onUnmounted, ref } from 'vue';
import { NLayoutSider, NIcon, NMenu, MenuOption, MenuGroupOption } from 'naive-ui';
import { HomeOutline, CaretDownOutline, ListOutline, SpeedometerOutline, FolderOpenOutline, SettingsOutline, DocumentTextOutline, InformationOutline, HammerOutline } from '@vicons/ionicons5';
import { RouterLink, useRouter } from 'vue-router';
import { EMBEDDED_BUILD, DEV } from '../const';
import { recorderController, Server } from '../utils/RecorderController';
import { generateServerIcon } from '../utils/ServerIconGenerator';

</script>
<script setup lang="ts">

const router = useRouter();
const collapsed = ref(true);

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

function renderServerIcon(server: Server) {
  if (server.iconPath && typeof server.iconPath === 'string' && server.iconPath.length > 0) {
    return () => h('img', {
      'src': server.iconPath,
      'referrerpolicy': 'no-referrer',
      'style': {
        'width': '100%',
        'height': '100%',
        'border-radius': '100%',
      },
    });
  } else {
    return renderIcon(generateServerIcon(server));
  }
}

function connectedMenu(): Array<MenuOption | MenuGroupOption> {
  let result: Array<MenuOption | MenuGroupOption> = [
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
      label: '工具箱',
      key: 'toolbox',
      path: '/toolbox',
      icon: renderIcon(HammerOutline),
    },
  ];
  if (DEV) {
    result.push({
      label: '调试',
      key: 'debug',
      path: '/componentsdebug',
      icon: renderIcon(SettingsOutline),
      disabled: false,
    });
  }
  const recorders = recorderController.listServers();
  if (recorders.length > 0) {
    result.push({
      key: 'divider',
      type: 'divider',
    });
  }
  const currentId = recorderController.recorder?.meta.id;
  recorders.forEach((r, i) => {
    if (r.id === currentId) {
      if (i > 0) {
        result.push({
          key: 'divider-1',
          type: 'divider',
        });
      }
      result = result.concat([{
        label: r.name,
        key: r.id,
        path: `/recorder/${r.id}`,
        icon: renderServerIcon(r),
      }, {
        label: '面板',
        key: 'dashboard',
        path: `/recorder/${r.id}`,
        icon: renderIcon(SpeedometerOutline),
      },
      {
        label: '房间列表',
        key: 'rooms',
        path: `/recorder/${r.id}/rooms`,
        icon: renderIcon(ListOutline),
      },
      {
        label: '文件管理器',
        key: 'files',
        path: `/recorder/${r.id}/files`,
        icon: renderIcon(FolderOpenOutline),
      },
      {
        label: '设置',
        key: 'settings',
        path: `/recorder/${r.id}/settings`,
        icon: renderIcon(SettingsOutline),
      },
      {
        label: '日志',
        key: 'logs',
        path: `/recorder/${r.id}/logs`,
        icon: renderIcon(DocumentTextOutline),
      }]);
      if (i < recorders.length - 1) {
        result.push({
          key: 'divider-2',
          type: 'divider',
        });
      }
    } else {
      result.push({
        label: r.name,
        key: r.id,
        path: `/recorder/${r.id}`,
        icon: renderServerIcon(r),
        disabled: false,
      });
    }
  });

  return result;
}

function embeddedMenu(): Array<MenuOption | MenuGroupOption> {
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
  },
  {
    label: '关于',
    key: 'about',
    path: '/about',
    icon: renderIcon(InformationOutline),
  }];
}

const menuOptions = ref<Array<MenuOption | MenuGroupOption>>(EMBEDDED_BUILD ? embeddedMenu() : connectedMenu());

const onRecorderChange = () => {
  // @ts-ignore
  menuOptions.value = connectedMenu();
};

const current = ref('');

router.afterEach((to, from) => {
  current.value = to.meta.key as string;
});

if (!EMBEDDED_BUILD) {
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
