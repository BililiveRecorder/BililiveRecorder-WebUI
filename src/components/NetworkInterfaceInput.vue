<template>
  <div class="input" :style="{
    '--label-width': labelWidth,
  }">
    <div v-if="props.label" class="label">{{ props.label }}</div>
    <div class="text-input">
      <n-auto-complete :style="{
        maxWidth: props.maxInputWidth,
      }" :value="props.value.value" @update-value="handleValueInput" :options="networkInterfaceOptions"
        :loading="loadingNetworkInterfaces" :render-label="renderLabel" @focus="onfocus" clearable>
      </n-auto-complete>
    </div>
  </div>
</template>
<script lang="ts">
import { recorderController } from '../utils/RecorderController';
declare module '@vue/runtime-dom' {
  export interface CSSProperties {
    [key: string]: any
  }
}
import { PropType, watch, onMounted, computed, ref, VNodeChild, h } from 'vue';
import { AutoCompleteGroupOption, AutoCompleteOption, NAutoComplete, NTag, useMessage } from 'naive-ui';
import { NetworkInterfaceDto } from '@/utils/api';

interface ConfigItem {
  hasValue: boolean,
  value: any,
  defaultValue: any,
}

interface EnumItem {
  value: any,
  label: string,
}
</script>

<script setup lang="ts">

const message = useMessage();

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  labelWidth: {
    type: String,
    default: '100px',
  },
  sameAsDefault: {
    type: Boolean,
    default: false,
  },
  hideDefault: {
    type: Boolean,
    default: false,
  },
  value: {
    type: Object as PropType<ConfigItem>,
    default: () => {
      return {
        hasValue: false,
        value: '',
        defaultValue: '',
      };
    },
  },
  enums: {
    type: Array as PropType<EnumItem[]>,
    default: () => {
      return [];
    },
  },
  unit: {
    type: String,
    default: '',
  },
  prefix: {
    type: String,
    default: '',
  },
  suffix: {
    type: String,
    default: '',
  },
  maxInputWidth: {
    type: String,
    default: '',
  },
});


watch(props.value, (newValue) => {
  if (!newValue.hasValue) {
    emit('update:value', {
      value: props.value.defaultValue,
      hasValue: false,
      defaultValue: props.value.defaultValue,
    });
  }
});

const emit = defineEmits(['update:value', 'changed']);

function handleValueInput(value: any) {
  emit('changed');
  if (props.sameAsDefault && value === props.value.defaultValue) {
    emit('update:value', {
      value,
      hasValue: false,
      defaultValue: props.value.defaultValue,
    });
  } else {
    emit('update:value', {
      value,
      hasValue: true,
      defaultValue: props.value.defaultValue,
    });
  }
}


// 网卡/IP 选择
const networkInterfaces = ref<NetworkInterfaceDto[]>([]);
const loadingNetworkInterfaces = ref(false);

const networkInterfaceOptions = computed(() => {
  return networkInterfaces.value.map((iface) => {
    return {
      type: 'group',
      key: `iface-group-${iface.name}`,
      label: `${iface.name} (${iface.description})`,
      children: [
        {
          label: `${iface.name}`,
          key: `iface-name-${iface.name}`,
          value: iface.name,
        },
        ...iface.addresses.map((addr) => ({
          label: `${addr}`,
          key: `iface-ip-${iface.name}-${addr}`,
          value: addr,
        })),
      ],
    } as AutoCompleteGroupOption;
  });
});

async function loadNetworkInterfaces() {
  if (recorderController.recorder == null) {
    return;
  }
  loadingNetworkInterfaces.value = true;
  try {
    networkInterfaces.value = await recorderController.recorder.getNetworkInterfaces();
  } catch (error: any) {
    message.error('获取网卡列表失败：' + (error?.message || error.toString()));
    console.error(error);
  } finally {
    loadingNetworkInterfaces.value = false;
  }
}

function renderLabel(option: AutoCompleteOption): VNodeChild {
  if (option.type === 'group' || typeof option.key !== 'string') {
    return option.label;
  }
  if (option.key.startsWith('iface-name-')) {
    return [
      option.label as string,
      ' ',
      h(NTag, { size: 'small', type: 'info' }, { default: () => '网卡' })
    ]
  }
  if (option.key.startsWith('iface-ip-')) {
    return [
      option.label as string,
      ' ',
      h(NTag, { size: 'small', type: 'success' }, { default: () => 'IP' })
    ]
  }

  return option.label;
}


function onfocus() {
  if (networkInterfaces.value.length === 0) {
    loadNetworkInterfaces();
  }
}

</script>
<style scoped lang="sass">

.input
  margin: 1em 0
  display: flex
  flex-direction: row
  align-items: center
  gap: 2em

  .default
    min-width: 8em
  .label
    min-width: var(--label-width)
  .text-input
    display: flex
    align-items: center
    gap: 0.5em
    flex: 1
</style>
