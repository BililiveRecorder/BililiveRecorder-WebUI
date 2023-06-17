<template>
  <n-list-item class="server" :style="style">
    <div class="item">
      <div class="icon">
        <img v-if="server.iconPath" :src="server.iconPath" referrerpolicy="no-referrer" />
        <component v-else :is="icon" />
      </div>
      <span>{{ server.name }}</span>
      <version-tag :version="'v' + version" type="recorder" />
    </div>
    <template #suffix>
      <n-dropdown :options="options" trigger="click" @select="onSelect">
        <n-button quaternary size="small" @click="stopPropagation">
          <n-icon :component="EllipsisHorizontal" />
        </n-button>
      </n-dropdown>
    </template>
  </n-list-item>
</template>
<script lang="ts">
import { onMounted, PropType, ref, computed, StyleValue, shallowRef } from 'vue';
import { useThemeVars, NButton, NListItem, NIcon, NDropdown } from 'naive-ui';
import { EllipsisHorizontal } from '@vicons/ionicons5';
import VersionTag from './VersionTag.vue';
import { Recorder } from '../utils/api';
import { rgba, hexToRgb } from '../utils/color';
import { Server } from '../utils/RecorderController';
import { generateServerIcon } from '../utils/ServerIconGenerator';

</script>
<script setup lang="ts">

const themeVars = useThemeVars();

const version = ref('');

const icon = shallowRef<any>();

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
  props.server.extraHeaders?.forEach((h) => {
    extraHeaders[h.key] = h.value;
  });
  props.server.auth?.type === 'basic' ? (extraHeaders.Authorization = `Basic ${btoa(`${props.server.auth.username}:${props.server.auth.password}`)}`) : null;
  const controller = new Recorder(props.server.path, extraHeaders, props.server.id);
  controller.getVersion().then((v) => {
    version.value = v.fullSemVer;
  }).catch(() => {
    version.value = 'unknown';
  });
  icon.value = generateServerIcon(props.server);
});

function onSelect(key: string) {
  emits(key as any);
}


</script>

<style lang="scss" scoped>
.server {
  color: var(--n-color);
  background: var(--n-bg-color);

  &:hover {
    color: var(--n-hover-color);
    background: var(--n-bg-hover-color);
  }

  &:active {
    color: var(--n-pressed-color);
    background: var(--n-bg-pressed-color);
  }
}

.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .icon {
    max-width: 32px;
    max-height: 32px;
    width: 32px;
    height: 32px;
    display: inline-block;

    img {
      width: 100%;
      height: 100%;
      border-radius: 100%;
    }
  }
}
</style>
