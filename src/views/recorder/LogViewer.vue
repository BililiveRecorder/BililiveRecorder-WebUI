<script lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { NCheckbox, NH2, NScrollbar, NDrawer, NDrawerContent, NButton, useThemeVars } from 'naive-ui';
import { recorderController } from '../../utils/RecorderController';
import { FormatConfig, LevelConfig, LogLine } from '../../components/LogLine';
import { LogDetail } from '../../components/LogDetail';
import type { RecorderLog } from '../../utils/api';

function searchLogIndex(el: Node): number {
  if (el instanceof HTMLElement) {
    if (el.hasAttribute('data-log-index')) {
      return parseInt(el.getAttribute('data-log-index') || '-1');
    }
  }
  let pointer = el.parentElement;
  while (pointer != null && pointer != document.body) {
    if (pointer.hasAttribute('data-log-index')) {
      return parseInt(pointer.getAttribute('data-log-index') || '-1');
    }
    pointer = pointer.parentElement;
  }
  return -1;
}

</script>
<script setup lang="ts">
const theme = useThemeVars();
const formatConfig = ref<FormatConfig>({
  showTime: true,
  showDate: false,
  showRoomId: true,
  showContext: true,
});
const levelConfig = ref<LevelConfig>({
  Verbose: false,
  Debug: false,
  Info: true,
  Warning: true,
  Error: true,
  Fatal: true,
});

let lastCursor = 0;
const logs = ref<RecorderLog[]>([]);
let timer = 0;
const showDrawer = ref(false);
const showingLog = ref({ '@t': new Date().toUTCString() });

function getLog() {
  recorderController.recorder?.fetchLog(lastCursor).then((d) => {
    if (d.continuous) {
      logs.value = logs.value.concat(d.logs);
    } else {
      logs.value = d.logs;
    }
    lastCursor = d.cursor;
  });
}

function showLogDetail(log: RecorderLog) {
  showingLog.value = log;
  showDrawer.value = true;
}
function closeLogDetail() {
  showDrawer.value = false;
}

function onCopyLog(e: ClipboardEvent) {
  const selection = window.getSelection();
  if (selection != null) {
    if (selection.anchorNode == selection.focusNode || selection.anchorNode == null || selection.focusNode == null) {
      return;
    }
    let anchorIndex = searchLogIndex(selection.anchorNode);
    let focusIndex = searchLogIndex(selection.focusNode);
    if (anchorIndex == -1 || focusIndex == -1) {
      return;
    }
    if (anchorIndex > focusIndex) {
      const t = anchorIndex;
      anchorIndex = focusIndex;
      focusIndex = t;
    }
    const selectedLog = logs.value.slice(anchorIndex, focusIndex + 1).filter((e) => {
      return levelConfig.value[typeof e['@l'] == 'string' ? e['@l'] : 'Info'];
    });
    e.clipboardData?.setData('text/plain', JSON.stringify(selectedLog));
    e.preventDefault();
  }
}

onMounted(() => {
  getLog();
  timer = setInterval(getLog, 5000);
});
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<template>
  <div class="log-container">
    <n-h2 class="title">日志</n-h2>
    <div class="filter-control">
      显示控制
      <n-checkbox v-model:checked="levelConfig.Debug">
        Debug
      </n-checkbox>
      <n-checkbox v-model:checked="levelConfig.Info">
        Info
      </n-checkbox>
      <n-checkbox v-model:checked="levelConfig.Warning">
        Warning
      </n-checkbox>
      <n-checkbox v-model:checked="levelConfig.Error">
        Error
      </n-checkbox>
      <n-checkbox v-model:checked="levelConfig.Fatal">
        Fatal
      </n-checkbox>
    </div>
    <div class="format-control">格式化控制
      <n-checkbox v-model:checked="formatConfig.showTime">
        显示时间
      </n-checkbox>
      <n-checkbox v-model:checked="formatConfig.showDate">
        显示完整日期时间
      </n-checkbox>
      <n-checkbox v-model:checked="formatConfig.showRoomId">
        显示房间号
      </n-checkbox>
      <n-checkbox v-model:checked="formatConfig.showContext">
        显示上下文
      </n-checkbox>
    </div>
    <n-scrollbar>
      <div class="log-area" :style="{
        '--time-color': theme.tagColor,
        '--room-color': theme.primaryColor + '66',
        '--base-color': theme.baseColor,
        '--text-color': theme.textColorBase,
        '--hover-color': theme.hoverColor,
        '--variable-color': theme.tagColor,
        '--debug-color': theme.baseColor + 'AA',
        '--debug-color-text': theme.textColorBase,
        '--debug-color-hover': theme.hoverColor,
        '--debug-color-variable': theme.tagColor,
        '--info-color': theme.infoColor + 'AA',
        '--info-color-hover': theme.infoColorHover + '22',
        '--info-color-text': theme.baseColor,
        '--info-color-variable': theme.infoColor + '66',
        '--warning-color': theme.warningColor + 'AA',
        '--warning-color-text': theme.baseColor,
        '--warning-color-hover': theme.warningColorHover + '22',
        '--warning-color-variable': theme.warningColor + '66',
        '--error-color': theme.errorColor + 'AA',
        '--error-color-text': theme.baseColor,
        '--error-color-hover': theme.errorColorHover + '22',
        '--error-color-variable': theme.errorColor + '66',
        '--fatal-color': theme.textColorBase + 'A',
        '--fatal-color-text': theme.baseColor,
        '--fatal-color-hover': theme.hoverColor,
        '--fatal-color-variable': theme.tagColor,
      }" @copy="onCopyLog">
        <log-line v-for="(log, index) in logs" :log="log" :format="formatConfig" :level="levelConfig" :key="index"
          @click="showLogDetail(log)" :index="index" />
      </div>
    </n-scrollbar>
    <n-drawer v-model:show="showDrawer" :show-mask="false" :width="400" :mask-closable="false">
      <n-drawer-content>
        <template #header>
          详细
        </template>
        <n-scrollbar>
          <log-detail :log="showingLog" />
        </n-scrollbar>
        <template #footer>
          <n-button @click="closeLogDetail">关闭</n-button>
        </template>
      </n-drawer-content>

    </n-drawer>
  </div>
</template>
<style lang="scss">
.log-container {
  height: calc(100% - 48px);
  display: flex;
  flex-direction: column;
  padding: 24px;

  .log-area {
    font-family: 'Courier New', Courier, monospace
  }

  .log-line {
    display: flex;
    align-items: flex-start;

    .content {
      flex: 1;
      margin-left: 0.25em;
      word-break: break-all;
    }

    .level {
      text-align: center;
      min-width: 5em;
      max-width: 5em;
      margin: 0 0.25em;
      background-color: var(--base-color);
      transition: all .3s var(--n-bezier);
      color: var(--text-color);
      border-radius: 0.5em;
      font-weight: bold;
      flex-shrink: 0;
    }

    .variable {
      background-color: var(--variable-color);
    }

    .room-id {
      background-color: var(--room-color);
      padding: 0.125em 0.25em;
      margin-right: 0.25em;
      border-radius: 0.5em;
    }

    .context {
      background-color: var(--variable-color);
      padding: 0.125em 0.25em;
      margin-right: 0.25em;
      border-radius: 0.5em;
    }

    &:hover {
      background-color: var(--hover-color);
    }
  }

  .log-line.Debug {
    .level {
      font-weight: normal;
      background-color: var(--debug-color);
      color: var(--debug-color-text);
    }

    .variable {
      background-color: var(--debug-color-variable);
    }

    &:hover {
      background-color: var(--debug-color-hover);
    }
  }

  .log-line.Info {
    .level {
      background-color: var(--info-color);
      color: var(--info-color-text);
    }

    .variable {
      background-color: var(--info-color-variable);
    }

    &:hover {
      background-color: var(--info-color-hover);
    }
  }

  .log-line.Warning {
    .level {
      background-color: var(--warning-color);
      color: var(--warning-color-text);
    }

    .variable {
      background-color: var(--warning-color-variable);
    }

    &:hover {
      background-color: var(--warning-color-hover);
    }
  }

  .log-line.Error {
    .level {
      background-color: var(--error-color);
      color: var(--error-color-text);
    }

    .variable {
      background-color: var(--error-color-variable);
    }

    &:hover {
      background-color: var(--error-color-hover);
    }
  }

  .log-line.Fatal {
    .level {
      background-color: var(--fatal-color);
      color: var(--fatal-color-text);
    }

    .variable {
      background-color: var(--fatal-color-variable);
    }

    &:hover {
      background-color: var(--fatal-color-hover);
    }
  }
}

.log-detail {
  display: grid;
  grid-template-columns: 1fr 2fr;
  word-break: break-all;
}

@media (max-width: 768px) {
  .log-container {
    .log-line {
      display: block;

      .level {
        display: inline-block;
      }

      .content {
        display: inline;
      }
    }
  }
}
</style>
