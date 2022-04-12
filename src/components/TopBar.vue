<template>
  <n-layout-header style="height: 64px;display: flex;align-items: center;justify-content: space-between" bordered>
    <n-h3 style="margin: 0 24px">录播姬</n-h3>
    <div style="margin: 0 24px">
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

const controller = inject<Ref<RecorderController>>('controller');
const router = useRouter();

function switchHost() {
  router.push('/');
}

</script>
