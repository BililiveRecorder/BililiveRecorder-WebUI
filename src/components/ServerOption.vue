<template>
  <n-list-item class="server" :style="style">
    {{ server.name }}
    <n-tag size="small">v{{ version }}</n-tag>
    <template #suffix>
      <n-dropdown :options="options" trigger="click" @select="onSelect">
        <n-button quaternary size="small" @click="stopPropagation">
          <n-icon :component="EllipsisHorizontal" />
        </n-button>
      </n-dropdown>
    </template>
  </n-list-item>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref, computed, StyleValue } from 'vue';
import { useThemeVars, NTag, NButton, NListItem, NIcon, NDropdown } from 'naive-ui';
import { EllipsisHorizontal } from '@vicons/ionicons5';
import { RecorderController } from '../api';
import { rgba, hexToRgb } from '../utils';


const themeVars = useThemeVars();

interface kvpairs {
  key: string;
  value: string;
}

interface Server {
  path: string;
  name: string;
  extraHeaders: kvpairs[];
}

const version = ref('');

const props = defineProps({
  server: {
    type: Object as PropType<Server>,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['modify', 'remove']);

const options = [
  {
    label: '修改',
    key: 'modify',
  },
  {
    label: '删除',
    key: 'delete',
  },
];

const style = computed<StyleValue>(() => {
  return props.selected ? {
    '--n-color': themeVars.value.primaryColor,
    '--n-bg-color': rgba(hexToRgb(themeVars.value.primaryColor), 0.2),
    '--n-pressed-color': themeVars.value.primaryColorPressed,
    '--n-bg-pressed-color': rgba(hexToRgb(themeVars.value.primaryColorPressed), 0.2),
    '--n-hover-color': themeVars.value.primaryColorHover,
    '--n-bg-hover-color': rgba(hexToRgb(themeVars.value.primaryColorHover), 0.2),
  } : {
    '--n-color': themeVars.value.textColor1,
    '--n-bg-color': 'transparent',
    '--n-pressed-color': themeVars.value.textColor1,
    '--n-bg-pressed-color': themeVars.value.pressedColor,
    '--n-hover-color': themeVars.value.textColor1,
    '--n-bg-hover-color': themeVars.value.buttonColor2Hover,
  };
});

function stopPropagation(e: MouseEvent) {
  e.stopPropagation();
}

onMounted(() => {
  const extraHeaders: { [key: string]: any } = {};
  props.server.extraHeaders.forEach((h) => {
    extraHeaders[h.key] = h.value;
  });
  const controller = new RecorderController(props.server.path, extraHeaders);
  controller.getVersion().then((v) => {
    version.value = v.fullSemVer;
  }).catch(() => {
    version.value = 'unknown';
  });
});

function onSelect(key: string) {
  emits(key as any);
}


</script>

<style lang="sass">

.server
  color: var(--n-color)
  background: var(--n-bg-color)
  &:hover
    color: var(--n-hover-color)
    background: var(--n-bg-hover-color)
  &:active
    color: var(--n-pressed-color)
    background: var(--n-bg-pressed-color)
</style>
