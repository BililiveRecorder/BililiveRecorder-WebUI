<template>
  <div class="input" :style="{
    '--label-width': labelWidth,
  }">
    <div v-if="props.label" class="label">{{ props.label }}</div>
    <n-switch v-if="props.type == 'boolean'" :value="props.value.value" @update-value="handleValueInput"></n-switch>
    <n-radio-group v-else-if="props.type == 'enum'" :value="props.value.value" @update-value="handleValueInput">
      <n-radio v-for="option in props.enums" :key="option.value" :value="option.value">{{ option.label }}</n-radio>
    </n-radio-group>
    <div v-else-if="props.type == 'number'" class="text-input">
      {{ props.prefix }}
      <n-input-number :style="{
        maxWidth: props.maxInputWidth,
      }" :value="props.value.value" @update-value="handleValueInput" :show-button="false">
        <template #suffix>{{ props.unit }}</template>
      </n-input-number>
      {{ props.suffix }}
    </div>
    <div v-else-if="props.type == 'textarea'" class="text-input">
      {{ props.prefix }}
      <n-input :style="{
        maxWidth: props.maxInputWidth,
      }" :type="'textarea'" :value="props.value.value" @update-value="handleValueInput" :show-button="false">
      </n-input>
    </div>
    <div v-else class="text-input">
      {{ props.prefix }}
      <n-input :style="{
        maxWidth: props.maxInputWidth,
      }" :value="props.value.value" @update-value="handleValueInput">
        <template #suffix>{{ props.unit }}</template>
      </n-input>
      {{ props.suffix }}
    </div>
    <div class="default" v-if="!(sameAsDefault || hideDefault)">
      <n-checkbox :checked="!props.value.hasValue" @update-checked="handleHasValueInput">使用默认值</n-checkbox>
    </div>
  </div>
</template>
<script lang="ts">
declare module '@vue/runtime-dom' {
  export interface CSSProperties {
    [key: string]: any
  }
}
import { defineProps, PropType, watch } from 'vue';
import { NInput, NCheckbox, NSwitch, NRadioGroup, NRadio, NInputNumber } from 'naive-ui';

type InputType = 'text' | 'boolean' | 'number' | 'textarea' | 'enum';

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

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  labelWidth: {
    type: String,
    default: '100px',
  },
  type: {
    type: String as PropType<InputType>,
    default: 'text',
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

function handleHasValueInput(value: boolean) {
  emit('changed');
  if (value) {
    emit('update:value', {
      value: props.value.defaultValue,
      hasValue: false,
      defaultValue: props.value.defaultValue,
    });
  } else {
    emit('update:value', {
      value: props.value.value,
      hasValue: true,
      defaultValue: props.value.defaultValue,
    });
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
