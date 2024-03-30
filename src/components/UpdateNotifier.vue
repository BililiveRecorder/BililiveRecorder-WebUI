<script lang="ts">
/* eslint-disable vue/valid-template-root */
import { h, onMounted } from 'vue';
import { STORAGE_UPDATE_IGNORE, VERSION } from '../const';
import { useNotification, NButton } from 'naive-ui';
import { getRecorderLatestVersion } from '../utils/version';
import { compare as compareVersion } from 'semver';
import { recorderController } from '../utils/RecorderController';

</script>
<script setup lang="ts">

const notification = useNotification();

onMounted(() => {
  getRecorderLatestVersion().then((version) => {
    try {
      if (compareVersion(version.webui.version, VERSION) > 0) {
        const store = JSON.parse(localStorage.getItem(STORAGE_UPDATE_IGNORE) || '{}');
        if (store.webui && store.webui === version.webui.version) {
          return;
        }
        const n = notification.warning({
          title: '更新提醒',
          content: `检测到新版本WebUI：${version.webui.version}，请及时更新！`,
          duration: 0,
          action: () => h('div', {
            style: {
              display: 'flex',
              gap: '1rem',
            },
          }, [
            h(NButton, {
              type: 'primary',
              text: true,
              onClick: () => {
                n.destroy();
                window.open(version.webui.url);
              },
            }, () => '立即更新'),
            h(NButton, {
              type: 'default',
              text: true,
              onClick: () => {
                n.destroy();
              },
            }, () => '忽略'),
            h(NButton, {
              type: 'default',
              text: true,
              onClick: () => {
                n.destroy();
                try {
                  const store = JSON.parse(localStorage.getItem(STORAGE_UPDATE_IGNORE) || '{}');
                  store.webui = version.webui.version;
                  localStorage.setItem(STORAGE_UPDATE_IGNORE, JSON.stringify(store));
                } catch (error) {
                  // ignore
                }
              },
            }, () => '忽略此版本'),
          ]),
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
    const recorderMeta = recorderController.recorder.meta;

    if (notified[recorderMeta.id]) {
      return;
    }

    recorderController.recorder.getVersion().then((v) => {
      const serverVersion = v.fullSemVer;
      getRecorderLatestVersion().then((version) => {
        try {
          if (compareVersion(version.recorder.version, serverVersion) > 0) {
            const store = JSON.parse(localStorage.getItem(STORAGE_UPDATE_IGNORE) || '{}');
            if (store[recorderMeta.id] && store[recorderMeta.id] === version.webui.version) {
              return;
            }
            notified[recorderMeta.id] = true;
            const n = notification.warning({
              title: '更新提醒',
              content: () => {
                return [
                  '录播姬 ',
                  h('code', recorderMeta.name),
                  ' 版本为：',
                  h('code', serverVersion),
                  '，当前录播姬最新版本为：',
                  h('code', version.recorder.version),
                  '，请及时更新！',
                ];
              },
              duration: 0,
              action: () => h('div', {
                style: {
                  display: 'flex',
                  gap: '1rem',
                },
              }, [
                h(NButton, {
                  type: 'primary',
                  text: true,
                  onClick: () => {
                    n.destroy();
                    window.open(version.recorder.url);
                  },
                }, () => '立即更新'),
                h(NButton, {
                  type: 'default',
                  text: true,
                  onClick: () => {
                    n.destroy();
                  },
                }, () => '忽略'),
                h(NButton, {
                  type: 'default',
                  text: true,
                  onClick: () => {
                    n.destroy();
                    try {
                      const store = JSON.parse(localStorage.getItem(STORAGE_UPDATE_IGNORE) || '{}');
                      store[recorderMeta.id] = version.webui.version;
                      localStorage.setItem(STORAGE_UPDATE_IGNORE, JSON.stringify(store));
                    } catch (error) {
                      // ignore
                    }
                  },
                }, () => '忽略此版本'),
              ]),
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
<template>
</template>
