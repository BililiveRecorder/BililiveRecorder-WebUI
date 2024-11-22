<template>
  <div class="player-container">
    <div style="width:100%">
      <n-breadcrumb>
        <n-breadcrumb-item v-for="folder in path" :key="folder.path" @click="goFolder(folder.path)">
          {{ folder.name }}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </div>
    <div class="player">
      <art-player v-if="loaded" :option="playerOptions" :danmuku="danmuSource" :headers="headers" />
    </div>
    <div>

    </div>
  </div>
</template>
<script lang="ts">

</script>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NBreadcrumb, NBreadcrumbItem } from 'naive-ui';
import ArtPlayer, { ArtPlayerOptions } from '../../components/ArtPlayer.vue';
import { FileDto } from '../../utils/api';
import { recorderController } from '../../utils/RecorderController';

const route = useRoute();
const router = useRouter();
const currentFile = ref('');

let mounted = false;
const loaded = ref(false);
const flvfile = ref<FileDto | null>(null);

const path = computed(() => {
  const folders = currentFile.value.split('/').filter((p) => p !== '');
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

function goFolder(path: string) {
  router.push({ path: `/recorder/${route.params.id}/files`, hash: `#${path}` });
}

function decToHexColor(v: number): string {
  let result = v.toString(16);
  result = '#' + result.padStart(6, '0');
  return result;
}

const playerOptions = ref<ArtPlayerOptions>({ url: '' });
const danmuSource = ref<any>(() => ([]));

function calcFilePath(url: string) {
  return new URL('.' + url, recorderController.recorder?.meta.path).toString();
}

const headers = recorderController.recorder!._getHeader();
onMounted(() => {
  mounted = true;
  if (route.hash && route.hash.startsWith('#/')) {
    currentFile.value = route.hash.slice(1);
  } else {
    router.push({ path: `/recorder/${route.params.id}/files`, hash: '#/' });
  }
  if (currentFile.value.endsWith('/')) {
    router.push({ path: `/recorder/${route.params.id}/files`, hash: route.hash });
  }
  if (!currentFile.value.endsWith('.flv')) {
    router.push({ path: `/recorder/${route.params.id}/files`, hash: '#/' });
  }
  if (recorderController.recorder == null) {
    console.error('recorder not ready');
    // never happen
    return;
  }
  const _t = currentFile.value.split('/');
  const filename = _t.pop();
  const path = _t.join('/');
  const xmlFileName = filename!.replace(/\.flv$/g, '.xml');
  recorderController.recorder.getFileList(path).then((e) => {
    if (!mounted) {
      return;
    }
    if (!e.exist) {
      return;
    }
    flvfile.value = e.files.find((f) => f.name === filename && !f.isFolder) as FileDto;
    const xmlFile = e.files.find((f) => f.name === xmlFileName && !f.isFolder) as FileDto;
    if (!flvfile.value) {
      return router.push({ path: `/recorder/${route.params.id}/files`, hash: '#/' });
    }
    playerOptions.value = {
      url: calcFilePath(flvfile.value.url),
      pip: true,
      setting: true,
      playbackRate: true,
      aspectRatio: true,
      flip: true,
      autoSize: true,
      autoMini: true,
      mutex: true,
      miniProgressBar: true,
      backdrop: false,
      fullscreen: true,
      fullscreenWeb: true,
      lang: 'zh-cn',
    };
    danmuSource.value = async () => {
      const xmltext = await (await fetch(calcFilePath(xmlFile.url), { headers })).text();
      try {
        const result: any[] = [];
        const xml = new DOMParser().parseFromString(xmltext, 'text/xml');
        Array.from(xml.getElementsByTagName('d')).forEach((e) => {
          const t = e.textContent;
          const args = e.getAttribute('p')!.split(',');
          result.push({
            text: t,
            color: decToHexColor(Number(args[3])),
            time: Number(args[0]),
            mode: 0,
          });
        });
        return result;
      } catch (error) {
        console.error(error);
      }
      return [];
    };
    loaded.value = true;
  });
});
onUnmounted(() => {
  mounted = false;
});
</script>
<style lang="scss" scoped>
.player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;

  .player {
    width: calc(100vw - 64px);
    height: min((100vw - 64px) * 9 / 16, 100vh - 64px);
  }
}

@media (min-width: 768px) {
  .player-container {
    padding: 24px;

    .player {
      width: max(60vw, 704px);
      height: min(max(60vw, 704px) * 9 / 16, 100vh - 64px);
    }
  }
}
</style>
