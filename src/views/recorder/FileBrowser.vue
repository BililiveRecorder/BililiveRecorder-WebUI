<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { FileDto, FolderDto } from '../../utils/api';
import { recorderController } from '../../utils/RecorderController';
import { NBreadcrumb, NBreadcrumbItem, NSpace, useThemeVars } from 'naive-ui';
import FileItem from '../../components/FileItem.vue';


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
      files.value = e.files;
    } else {
      router.push({ hash: '#/' });
    }
  });
});

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
      <file-item v-for="file in files" :key="file.name" :file="file" :current-path="currentPath" />
    </n-space>
  </div>
</template>
<style lang="scss" scoped>
.file-browser-container {
  padding: 24px;
}
</style>
