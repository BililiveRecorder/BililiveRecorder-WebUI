<template>
  <n-modal :show="props.show" style="max-width: 600px;" preset="card" title="房间设置"></n-modal>
</template>
<script setup lang="ts">
import { NModal } from 'naive-ui';
import { watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  objectId: {
    type: String,
    default: '',
  },
});
let changed = false;
watch(props, (oldVal, newVal) => {
  if (oldVal.show !== newVal.show) {
    if (newVal.show) {
      changed = false;
    }
  }
}, { deep: true });

</script>
