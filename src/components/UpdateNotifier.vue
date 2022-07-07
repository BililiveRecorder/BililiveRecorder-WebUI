<script lang="ts">/* eslint-disable vue/valid-template-root */</script>
<template>
</template>
<script setup lang="ts">
import { h, onMounted } from 'vue';
import { VERSION } from '../const';
import { useNotification, NButton } from 'naive-ui';
import { getRecorderLatestVersion } from '../utils/version';
import { compare as compareVersion } from 'semver';
import { recorderController } from '../utils/RecorderController';

const notification = useNotification();

onMounted(() => {
  getRecorderLatestVersion().then((version) => {
    try {
      if (compareVersion(version.webui.version, VERSION) > 0) {
        const n = notification.warning({
          title: '更新提醒',
          content: `检测到新版本WebUI：${version.webui.version}，请及时更新！`,
          duration: 0,
          action: () =>
            h(NButton, {
              type: 'primary',
              text: true,
              onClick: () => {
                n.destroy();
                window.open(version.webui.url);
              },
            }, () => '立即更新'),
        });
      }
    } catch (e) {
      // ignore
    }
  }).catch(() => { });
});

const notified: { [key: string]: boolean } = {};

function onRecorderChange() {
  if (recorderController.recorder !== null) {
    if (notified[recorderController.recorder.meta.id]) {
      return;
    }
    const recorderMeta = recorderController.recorder.meta;
    recorderController.recorder.getVersion().then((v) => {
      const serverVersion = v.fullSemVer;
      getRecorderLatestVersion().then((version) => {
        try {
          if (compareVersion(version.recorder.version, serverVersion) > 0) {
            notified[recorderMeta.id] = true;
            const n = notification.warning({
              title: '更新提醒',
              content: `录播姬${recorderMeta.name} 版本为：${serverVersion}，当前录播姬最新版本为：${version.recorder.version}，请及时更新！`,
              duration: 0,
              action: () =>
                h(NButton, {
                  type: 'primary',
                  text: true,
                  onClick: () => {
                    n.destroy();
                    window.open(version.recorder.url);
                  },
                }, () => '立即更新'),
            });
          }
        } catch (e) {
          // ignore
        }
      }).catch(() => { });
    }).catch(() => { });
  }
}

recorderController.addEventListener('recorder-change', onRecorderChange);

</script>
