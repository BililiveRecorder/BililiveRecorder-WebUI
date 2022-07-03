<template>
  <div class="about-container">
    <n-h2>关于</n-h2>
    <div class="webui-about">
      <n-h3 prefix="bar">BililiveRecorder-WebUI <n-tag>{{ VERSION }}</n-tag>
        <n-tag> 嵌入版本 </n-tag>
      </n-h3>
      <p>Github: <n-a href="https://github.com/BililiveRecorder/BililiveRecorder-WebUI" target="_blank">
          https://github.com/BililiveRecorder/BililiveRecorder-WebUI</n-a>
      </p>
      <p>Copyright (C) 2022 <n-a href="https://github.com/shugen002" target="_blank">Shugen002</n-a>
      </p>
      <p>GNU General Public License v3.0</p>
      <p>
        <n-space>
          <n-button tag="a" target="_blank" href="https://github.com/BililiveRecorder/BililiveRecorder-WebUI/issues">
            问题反馈
          </n-button>
          <n-button tag="a" target="_blank" href="https://github.com/BililiveRecorder/BililiveRecorder-WebUI/releases">
            发布日志
          </n-button>
        </n-space>
      </p>
    </div>
    <div class="server-about">
      <n-h3 prefix="bar">BililiveRecorder<n-tag v-if="serverVersion">{{ serverVersion }}</n-tag>
      </n-h3>
      <p>Github: <n-a href="https://github.com/Bililive/BililiveRecorder" target="_blank">
          https://github.com/Bililive/BililiveRecorder</n-a>
      </p>
      <p>GNU General Public License v3.0</p>
      <p>
        <n-space>
          <n-button tag="a" target="_blank" href="https://github.com/BililiveRecorder/BililiveRecorder/issues">问题反馈
          </n-button>
          <n-button tag="a" target="_blank" href="https://github.com/BililiveRecorder/BililiveRecorder/releases">发布日志
          </n-button>
        </n-space>
      </p>
    </div>
    <div class="funthing">
      <img src="../assets/funthing.png" alt="">
    </div>
  </div>
</template>

<script setup lang="ts">
import { NH2, NH3, NA, NTag, NButton, NSpace } from 'naive-ui';
import { VERSION } from '../const';
import { onMounted, ref } from 'vue';
import { recorderController } from '../utils/RecorderController';

const serverVersion = ref('');

onMounted(() => {
  if (recorderController.recorder !== null) {
    try {
      recorderController.recorder.getVersion().then((v) => {
        serverVersion.value = v.fullSemVer;
      });
    } catch (error) {
      console.error(error);
      serverVersion.value = 'Unknown';
    }
  }
});
</script>

<style lang="scss" scoped>
.about-container {
  padding: 24px
}
</style>
