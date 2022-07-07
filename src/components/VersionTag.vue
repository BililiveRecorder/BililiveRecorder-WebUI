<template>
  <n-popover trigger="hover">
    <template #trigger>
      <n-tag size="small" :type="versionStatus">{{ props.version }}
      </n-tag>
    </template>
    {{ versionText }}
  </n-popover>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref, watch } from 'vue';
import { NTag, NPopover } from 'naive-ui';
import { getRecorderLatestVersion } from '../utils/version';
import { compare as compareVersion } from 'semver';

const props = defineProps({
  version: {
    type: String as PropType<string>,
    required: true,
  },
  type: {
    type: String as PropType<'webui' | 'recorder'>,
    required: true,
  },
  cache: {
    default: true,
  },
});

const versionStatus = ref<'default' | 'error' | 'primary' | 'info' | 'success' | 'warning'>('default');
const versionText = ref('未知');
onMounted(() => {
  getRecorderLatestVersion(!props.cache).then((latest) => {
    try {
      switch (compareVersion(props.version, latest[props.type].version)) {
        case -1:
          versionStatus.value = 'warning';
          versionText.value = `最新版本 ${latest[props.type].version}`;
          break;
        case 0:
          versionStatus.value = 'info';
          versionText.value = `已是最新版本`;
          break;
        case 1:
          versionStatus.value = 'success';
          versionText.value = `已是最新版本`;
          break;
        default:
          versionStatus.value = 'default';
          versionText.value = `当前版本 ${props.version}`;
          break;
      };
    } catch (error) {
      versionStatus.value = 'warning';
      versionText.value = `最新版本 ${latest[props.type].version}`;
    }
  }).catch(() => {
    versionStatus.value = 'warning';
    versionText.value = `版本检查失败`;
  });
});
watch(props, (newVal) => {
  const newVer = newVal.version;
  getRecorderLatestVersion(!props.cache).then((latest) => {
    try {
      switch (compareVersion(newVer, latest[props.type].version)) {
        case -1:
          versionStatus.value = 'warning';
          versionText.value = `最新版本 ${latest[props.type].version}`;
          break;
        case 0:
          versionStatus.value = 'info';
          versionText.value = '已是最新版本';
          break;
        case 1:
          versionStatus.value = 'success';
          versionText.value = '已是最新版本';
          break;
        default:
          versionStatus.value = 'default';
          versionText.value = `当前版本 ${newVer}`;
          break;
      };
    } catch (error) {
      versionStatus.value = 'warning';
      versionText.value = `最新版本 ${latest[props.type].version}`;
    }
  }).catch(() => {
    versionStatus.value = 'warning';
    versionText.value = '版本检查失败';
  });
});
</script>
