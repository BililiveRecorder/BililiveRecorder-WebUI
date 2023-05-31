<script lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { FileDto, FolderDto } from '../../utils/api';
import { recorderController } from '../../utils/RecorderController';
import { NBreadcrumb, NBreadcrumbItem, NSelect, useThemeVars } from 'naive-ui';
import FileItem from '../../components/FileItem.vue';
import { STORAGE_FILES_SORT_OPTION } from '../../const';
const sortOptions = [
  {
    label: '最后修改时间 ↓',
    value: 1,
  },
  {
    label: '最后修改时间 ↑',
    value: 2,
  },
  {
    label: '文件名 ↓',
    value: 3,
  },
  {
    label: '文件名 ↑',
    value: 4,
  },
  {
    label: '文件大小 ↓',
    value: 5,
  },
  {
    label: '文件大小 ↑',
    value: 6,
  },
];
</script>
<script setup lang="ts">


const theme = useThemeVars();
const route = useRoute();
const router = useRouter();

const updateTitle = inject<(...extra: string[]) => void>('updateTitle') || function () { };

const currentPath = ref('/');
const files = ref<Array<FileDto | FolderDto>>([]);
const sort = ref(parseInt(window.localStorage.getItem(STORAGE_FILES_SORT_OPTION) || '4'));
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

function sortFiles(files: Array<FileDto | FolderDto>) {
  switch (sort.value) {
    case 1:
      return files.sort((a, b) => {
        return new Date(b.lastModified).valueOf() - new Date(a.lastModified).valueOf();
      });
    case 2:
      return files.sort((a, b) => {
        return new Date(a.lastModified).valueOf() - new Date(b.lastModified).valueOf();
      });
    case 3:
      return files.sort((a, b) => {
        return b.name > a.name ? 1 : -1;
      });
    case 4:
      return files.sort((a, b) => {
        return a.name > b.name ? 1 : -1;
      });
    case 5:
      return files.sort((a, b) => {
        return (b.isFolder ? 0 : b.size) - (a.isFolder ? 0 : a.size);
      });
    case 6:
      return files.sort((a, b) => {
        return (a.isFolder ? 0 : a.size) - (b.isFolder ? 0 : b.size);
      });
    default:
      return files;
      break;
  }
}


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
      files.value = sortFiles(e.files);
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
      files.value = sortFiles(e.files);
    } else {
      router.push({ hash: '#/' });
    }
  });
});

watch(currentPath, (newVal) => {
  setTimeout(() => updateTitle(newVal), 0);
});
watch(sort, (newVal) => {
  window.localStorage.setItem(STORAGE_FILES_SORT_OPTION, newVal.toString());
  files.value = sortFiles(files.value);
});

function goFolder(path: string) {
  router.push({ hash: `#${path}` });
}

</script>
<template>
  <div class="file-browser-container" :style="{
    '--border-radius': theme.borderRadius,
    '--background-color': theme.cardColor
  }">
    <div class="head">
      <n-breadcrumb>
        <n-breadcrumb-item v-for="folder in path" :key="folder.path" @click="goFolder(folder.path)">
          {{ folder.name }}
        </n-breadcrumb-item>
      </n-breadcrumb>
      <div class="sort">
        <n-select v-model:value="sort" size="small" :options="sortOptions"></n-select>
      </div>
    </div>
    <div class="files">
      <file-item v-for="file in files" :key="file.name" :file="file" :current-path="currentPath" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.file-browser-container {
  padding: 8px;
  display: flex;
  gap: 8px;
  flex-direction: column;

  .head {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .sort {
      min-width: 10rem;
    }
  }

  .files {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (min-width: 668px) {
  .file-browser-container {
    padding: 24px;
  }
}
</style>
