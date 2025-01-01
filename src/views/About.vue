<template>
  <div style="padding: 24px">
    <n-h2>关于</n-h2>
    <div class="webui-about">
      <n-h3 prefix="bar">BililiveRecorder-WebUI
        <version-tag :version="VERSION" type="webui" :cache="false" />
        <n-tag v-if="EMBEDDED_BUILD"> 嵌入版本 </n-tag>
      </n-h3>
      <p>Github: <n-a href="https://github.com/BililiveRecorder/BililiveRecorder-WebUI" target="_blank">
          https://github.com/BililiveRecorder/BililiveRecorder-WebUI</n-a>
      </p>
      <p>Copyright (C) 2022-2025 <n-a href="https://github.com/shugen002" target="_blank">Shugen002</n-a>
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
          <n-button v-if="showWebUIUpdate" tag="a" target="_blank" :href="latestVersion.webui.url">
            更新版本
          </n-button>
        </n-space>
      </p>
      <div v-if="showWebUIUpdate">
        <n-h4 prefix="bar">{{ latestVersion.webui.version }} 更新日志</n-h4>
        <pre style="white-space: pre-wrap">{{ latestVersion.webui.body }}</pre>
      </div>
    </div>
    <div class="server-about">
      <n-h3 prefix="bar">BililiveRecorder
        <version-tag v-if="serverVersion" :version="serverVersion" type="recorder" :cache="false" />
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
          <n-button v-if="showRecorderUpdate" tag="a" target="_blank" :href="latestVersion.recorder.url">更新版本
          </n-button>
        </n-space>
      </p>
      <div v-if="showRecorderUpdate">
        <n-h4 prefix="bar">{{ latestVersion.recorder.version }} 更新日志</n-h4>
        <pre style="white-space: pre-wrap">{{ latestVersion.recorder.body }}</pre>
      </div>
    </div>
    <div class="funthing">
      <img src="../assets/funthing.png" alt="">
    </div>
  </div>
</template>

<script setup lang="ts">
import { NH2, NH3, NH4, NA, NTag, NButton, NSpace } from 'naive-ui';
import { VERSION, EMBEDDED_BUILD } from '../const';
import { onMounted, ref } from 'vue';
import { recorderController } from '../utils/RecorderController';
import VersionTag from '../components/VersionTag.vue';
import { getRecorderLatestVersion } from '../utils/version';
import { compare as compareVersion } from 'semver';

const serverVersion = ref('');
const latestVersion = ref({
  webui: {
    version: 'v0.0.0',
    url: 'https://github.com/BililiveRecorder/BililiveRecorder-WebUI/releases/latest',
    body: '',
  },
  recorder: {
    version: 'v0.0.0',
    url: 'https://github.com/BililiveRecorder/BililiveRecorder/releases/latest',
    body: '',
  },
});
const showWebUIUpdate = ref(false);
const showRecorderUpdate = ref(false);

onMounted(() => {
  if (recorderController.recorder !== null) {
    recorderController.recorder.getVersion().then((v) => {
      serverVersion.value = v.fullSemVer;
      getRecorderLatestVersion().then((lv) => {
        latestVersion.value.recorder = lv.recorder;
        try {
          if (compareVersion(v.fullSemVer, lv.recorder.version) < 0) {
            showRecorderUpdate.value = true;
          };
        } catch (error) {
          showRecorderUpdate.value = true;
        }
      }).catch(() => { });
    }).catch((e) => {
      getRecorderLatestVersion().then((lv) => {
        showRecorderUpdate.value = true;
        latestVersion.value.recorder = lv.recorder;
      }).catch(() => { });
      console.error(e);
      serverVersion.value = 'unknown';
    });
  } else {
    getRecorderLatestVersion().then((lv) => {
      showRecorderUpdate.value = true;
      latestVersion.value.recorder = lv.recorder;
    }).catch(() => { });
  }
  getRecorderLatestVersion().then((v) => {
    latestVersion.value.webui = v.webui;
    try {
      if (compareVersion(VERSION, v.webui.version) < 0) {
        showWebUIUpdate.value = true;
      };
    } catch (error) {
      showWebUIUpdate.value = true;
    }
  }).catch(() => { });
});
</script>
