<script setup lang="ts">
import { useRouter } from 'vue-router';
import { FileDto, FolderDto } from '../utils/api';
import { byteToHuman } from '../utils/size';
import { NIcon, NTime, useThemeVars } from 'naive-ui';
import { File, FileVideo, Folder } from '@vicons/fa';
import { recorderController } from '../utils/RecorderController';

const theme = useThemeVars();
const router = useRouter();
const props = defineProps({
  file: {
    type: Object as () => FileDto | FolderDto,
    required: true,
  },
  currentPath: {
    type: String,
    default: '/',
  },
});

function calcFilePath(url: string) {
  return new URL(url, recorderController.recorder?.meta.path).toString();
}

function onClick(e: MouseEvent) {
  if (props.file.isFolder) {
    e.preventDefault();
    e.stopPropagation();
    router.push({ hash: '#' + props.currentPath + props.file.name });
  }
}
</script>
<template>
  <a class="item" :href="file.isFolder ? ('#' + props.currentPath + file.name) : calcFilePath(file.url)" :style="{
    '--text-color': theme.textColor1,
    '--hover-color': theme.hoverColor,
    '--pressed-color': theme.pressedColor,
    '--border-radius': theme.borderRadius,
    '--background-color': theme.cardColor,
  }" @click="onClick">
    <div class="item-left">
      <n-icon size="20">
        <folder v-if="file.isFolder" />
        <file-video v-else-if="file.name.endsWith('.flv')" />
        <file v-else />
      </n-icon>
      {{ file.name }}
      <span v-if="!file.isFolder">{{ byteToHuman(file.size) }}</span>
    </div>
    <n-time :time="new Date(file.lastModified)"
      :type="(Date.now() - new Date(file.lastModified).valueOf() > 2678400000) ? 'datetime' : 'relative'"></n-time>
  </a>
</template>
<style lang="scss" scoped>
.item {
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .item-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  &:hover {
    background-color: var(--hover-color);
  }

  &:active {
    background-color: var(--pressed-color);
  }
}
</style>
