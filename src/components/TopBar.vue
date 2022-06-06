<template>
  <n-layout-header style="height: 64px;display: flex;align-items: center;justify-content: space-between" bordered>
    <div style="display: flex;align-items: center">
      <img src="/favicon.svg" style="height: 36px;margin-left: 12px;" />
      <n-h3 style="margin: 0 24px">
        B站录播姬
      </n-h3>
    </div>
    <div style="margin: 0 24px" v-if="!EMBEDED_BUILD">
      <n-input-group>
        <n-input size="small" :disabled="true" :value="(controller?.extra?.name)"></n-input>
        <n-button size="small" @click="switchHost">切换</n-button>
      </n-input-group>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
import { NLayoutHeader, NH3, NInput, NInputGroup, NButton } from 'naive-ui';
import { inject, Ref } from 'vue';
import { RecorderController } from '../api';
import { useRouter } from 'vue-router';
import { EMBEDED_BUILD } from '../const';

const controller = inject<Ref<RecorderController>>('controller');
const router = useRouter();

function switchHost() {
  router.push('/');
}

</script>
