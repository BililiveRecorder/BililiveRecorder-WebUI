<template>
  <div>
    <n-h2>关于</n-h2>
    <div class="webui-about">
      <n-h3 prefix="bar">BililiveRecorder-WebUI <n-tag>{{ VERSION }}</n-tag>
      </n-h3>
      <p>Github: <n-a href="https://github.com/shugen002/BililiveRecorder-WebUI" target="_blank">
          https://github.com/shugen002/BililiveRecorder-WebUI</n-a>
      </p>
      <p>Copyright (C) 2022 <n-a href="https://github.com/shugen002" target="_blank">Shugen002</n-a>. All rights
        reserved. (这人还在想用什么协议，寄！)</p>
    </div>
    <div class="server-about">
      <n-h3 prefix="bar">BililiveRecorder<n-tag v-if="serverVersion">{{ serverVersion }}</n-tag>
      </n-h3>
      <p>Github: <n-a href="https://github.com/Bililive/BililiveRecorder" target="_blank">
          https://github.com/Bililive/BililiveRecorder</n-a>
      </p>
      <p>GNU General Public License v3.0</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NH2, NH3, NA, NTag } from 'naive-ui';
import { VERSION } from '../const';
import { inject, onMounted, ref, Ref } from 'vue';
import { RecorderController } from '../api';

const controller = inject<Ref<RecorderController>>('controller');

const serverVersion = ref('');

onMounted(() => {
  if (controller?.value) {
    try {
      controller.value.getVersion().then((v) => {
        serverVersion.value = v.fullSemVer;
      });
    } catch (error) {
      console.error(error);
      serverVersion.value = 'Unknown';
    }
  }
});

</script>