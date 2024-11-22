<template>
  <div style="width:100%;height:100%" ref="artRef"></div>
</template>
<script lang="ts">

export type ArtPlayerOptions = Omit<ConstructorParameters<typeof ArtPlayer>[0], 'container' | 'customType'>

import { ref, onMounted, onUnmounted, PropType } from 'vue';
import ArtPlayer, { } from 'artplayer';
import artPlayerPluginDanmuku from 'artplayer-plugin-danmuku';
import mpegtsjs from 'mpegts.js';

</script>
<script setup lang="ts">

let instance: Artplayer | null = null;
defineExpose({
  instance,
});

const props = defineProps({
  option: {
    type: Object as PropType<ArtPlayerOptions>,
    required: true,
  },
  danmuku: {
    default: () => ([]),
  },
  headers: {
    default: () => ({}),
  },
});

const artRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  instance = new ArtPlayer({
    ...props.option,
    container: artRef.value as HTMLDivElement,
    customType: {
      flv: function (video, url) {
        if (mpegtsjs.isSupported()) {
          const flvPlayer = mpegtsjs.createPlayer({
            type: 'flv',
            url: url,
            hasVideo: true,
            hasAudio: true,
          }, {
            headers: props.headers,
          });
          flvPlayer.attachMediaElement(video);
          flvPlayer.load();
        } else {
          if (instance) {
            instance.notice.show = '不支持播放格式：flv';
          }
        }
      },
    },
    plugins: [
      artPlayerPluginDanmuku({
        danmuku: props.danmuku,
      }),
    ],
  });
});

onUnmounted(() => {
  if (instance) {
    instance.destroy();
  }
});

</script>
