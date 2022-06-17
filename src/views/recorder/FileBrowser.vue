<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter, RouterLink } from 'vue-router';
import { FileDto, FolderDto } from '../../utils/api';
import { byteToHuman } from '../../utils/size';
import { recorderController } from '../../utils/RecorderController';
import { NBreadcrumb, NBreadcrumbItem, NSpace, NIcon, NA, NTime, useThemeVars } from 'naive-ui';
import { File, FileVideo, Folder } from '@vicons/fa';

const theme = useThemeVars();
const route = useRoute();
const router = useRouter();
const currentPath = ref('/');
const files = ref<Array<FileDto | FolderDto>>([]);
const path = computed(() => {
  const folders = currentPath.value.split('/').filter((p) => p !== '');
  let path = '';
  const result = [{
    name: '工作目录',
    path: '/',
  }];
  for (const folder of folders) {
    result.push({
      name: folder,
      path: `${path}/${folder}`,
    });
    path += `/${folder}`;
  }
  return result;
});

onMounted(() => {
  if (route.hash && route.hash.startsWith('#/')) {
    currentPath.value = route.hash.slice(1);
  } else {
    currentPath.value = '/';
  }
  if (!currentPath.value.endsWith('/')) {
    currentPath.value = `${currentPath.value}/`;
  }
  recorderController.recorder?.getFileList(currentPath.value).then((e) => {
    if (e.path !== currentPath.value) {
      return;
    }
    if (e.exist) {
      files.value = e.files;
    } else {
      router.push({ hash: '#/' });
    }
  });
});

onBeforeRouteUpdate((to, from) => {
  if (to.hash && to.hash.startsWith('#/')) {
    currentPath.value = to.hash.slice(1);
    if (!currentPath.value.endsWith('/')) {
      currentPath.value = `${currentPath.value}/`;
    }
  } else {
    currentPath.value = '/';
  }
  recorderController.recorder?.getFileList(currentPath.value).then((e) => {
    if (e.path !== currentPath.value) {
      return;
    }
    if (e.exist) {
      console.log(e);
      files.value = e.files;
    } else {
      router.push({ hash: '#/' });
    }
  });
});

function calcFilePath(url: string) {
  return new URL(url, recorderController.recorder?.meta.path).toString();
}

function goFolder(path: string) {
  router.push({ hash: `#${path}` });
}

</script>
<template>
  <div class="file-browser-container">
    <n-space vertical :style="{
      '--border-radius': theme.borderRadius,
      '--background-color': theme.cardColor
    }">
      <n-breadcrumb>
        <n-breadcrumb-item v-for="folder in path" :key="folder.path" @click="goFolder(folder.path)">
          {{ folder.name }}
        </n-breadcrumb-item>
      </n-breadcrumb>
      <div v-for="file in files" :key="file.name" class="item">
        <div class="item-left" :align="'center'">
          <n-icon size="20">
            <folder v-if="file.isFolder" />
            <file-video v-else-if="file.name.endsWith('.flv')" />
            <file v-else />
          </n-icon>
          <router-link v-if="file.isFolder" :to="{
            hash: '#' + currentPath + file.name,
          }" custom v-slot="{ navigate, href }">
            <n-a :href="href" @click="navigate">{{ file.name }}</n-a>
          </router-link>
          <n-a v-else :href="calcFilePath(file.url)">
            {{ file.name }}
          </n-a>
          <span v-if="!file.isFolder">{{ byteToHuman(file.size) }}</span>
        </div>
        <n-time :time="new Date(file.lastModified)"
          :type="(Date.now() - new Date(file.lastModified).valueOf() > 2678400000) ? 'datetime' : 'relative'"></n-time>
      </div>
    </n-space>
  </div>
</template>
<style lang="scss">
.file-browser-container {
  .item {
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
  }
}
</style>
