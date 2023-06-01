<template>
  <div class="toolbox-home-container">
    <p>没想好怎么弄的页面呢。</p>
    <n-button @click="goToFindSameRoom">查找相同房间</n-button>
  </div>
</template>
<script lang="ts">
import { NButton } from 'naive-ui';
import { useRouter } from 'vue-router';
</script>
<script setup lang="ts">
const router = useRouter();
function goToFindSameRoom() {
  router.push('/toolbox/sameroom');
}
</script>
<style lang="scss" scoped>
.toolbox-home-container {
  padding: 24px;
}
</style>
