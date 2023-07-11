<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter, RouterLink } from 'vue-router';
import { NCard, NA } from 'naive-ui';
import { ListOutline, FolderOpenOutline, SettingsOutline } from '@vicons/ionicons5';
import VersionTag from '../../components/VersionTag.vue';
import { recorderController } from '../../utils/RecorderController';
import { EMBEDDED_BUILD } from '../../const';

const router = useRouter();
const route = useRoute();

const controller = recorderController;
const updateTitle = inject<(...extra: string[]) => void>('updateTitle') || function () { };

const version = ref('unknown');

const id = ref('');

onMounted(() => {
  if (route.params.id) {
    id.value = route.params.id as string;
    if (controller.recorder !== null && controller.recorder.meta.id === route.params.id) {
      if (route.query.target) {
        router.replace(decodeURIComponent(route.query.target as string));
      } else {
        setTimeout(() => updateTitle(controller.recorder!.meta.name), 0);
        controller.recorder.getVersion().then((v) => {
          version.value = v.fullSemVer;
        });
      }
    } else {
      const server = controller.listServers().find((s) => s.id === route.params.id);
      if (server) {
        controller.changeHost(server.id);
        if (route.query.target) {
          router.replace(decodeURIComponent(route.query.target as string));
        } else {
          setTimeout(() => updateTitle(controller.recorder!.meta.name), 0);
          controller.recorder!.getVersion().then((v) => {
            version.value = v.fullSemVer;
          });
        }
      } else if (!EMBEDDED_BUILD) {
        router.push('/').catch(console.error);
      }
    }
  } else {
    if (!EMBEDDED_BUILD) {
      router.push('/').catch(console.error);
    } else {
      router.push('/recorder/local').catch(console.error);
    }
  }
});

onBeforeRouteUpdate((to, from, next) => {
  if (to.params.id !== from.params.id) {
    id.value = to.params.id as string;
    if (to.params.id) {
      if (controller.recorder !== null && controller.recorder.meta.id === to.params.id) {
        next();
      } else {
        const server = controller.listServers().find((s) => s.id === to.params.id);
        if (server) {
          controller.changeHost(server.id);
          next();
          setTimeout(() => updateTitle(controller.recorder!.meta.name), 0);
          controller.recorder!.getVersion().then((v) => {
            version.value = v.fullSemVer;
          }).catch(() => {
            version.value = 'unknown';
          });
        } else if (!EMBEDDED_BUILD) {
          next('/');
        }
      }
    } else {
      if (!EMBEDDED_BUILD) {
        next('/');
      } else {
        next('/recorder/local');
      }
    }
  } else {
    next();
  }
});

</script>

<template>
  <div class="dashboard-container">
    <div class="title">
      <h1>
        mikufans录播姬
        <version-tag :version="'v' + version" type="recorder" />
      </h1>
      <p>{{ recorderController.recorder?.meta.name }}
        <n-a :href="recorderController.recorder?.meta.path">
          {{ recorderController.recorder?.meta.path }}
        </n-a>
      </p>
    </div>
    <div class="function-list">
      <router-link :to="`/recorder/${id}/rooms`" custom v-slot="{ navigate }">
        <n-card @click="navigate">
          <div class="function">
            <div class="icon">
              <list-outline />
            </div>
            <div class="description">
              <h3>房间列表</h3>
              添加、删除或修改录制的直播间
            </div>
          </div>
        </n-card>
      </router-link>
      <router-link :to="`/recorder/${id}/files`" custom v-slot="{ navigate }">
        <n-card @click="navigate">
          <div class="function">
            <div class="icon">
              <folder-open-outline />
            </div>
            <div class="description">
              <h3>文件管理器</h3>
              查看当前录播姬工作目录下的文件
            </div>
          </div>
        </n-card>
      </router-link>
      <router-link :to="`/recorder/${id}/settings`" custom v-slot="{ navigate }">
        <n-card @click="navigate">
          <div class="function">
            <div class="icon">
              <settings-outline />
            </div>
            <div class="description">
              <h3>录播姬设置</h3>
              修改录播姬的设置
            </div>
          </div>
        </n-card>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  padding: 24px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .title {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .function-list {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1em;
    margin-bottom: 6em;

    .function {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 15em;

      .icon {
        height: 8em;
        width: 8em;
        padding: 2em;
        display: flex;
        justify-content: center;
        align-items: center;

        svg {
          height: 100%;
          width: 100%;
        }
      }

      .description {
        width: 100%;
      }
    }
  }

  @media screen and (max-width: 768px) {
    .function-list {
      flex-direction: column;
      width: 100%;
      margin-bottom: 0;

      .function {
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: 1em;

        .icon {
          height: 5em;
          width: 5em;
          padding: 0em;
        }

        .description {
          flex: 1;

          h3 {
            margin: 0;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .dashboard-container {
    height: unset;
  }
}
</style>
