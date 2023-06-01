import { RecorderLog } from '../utils/api';

export interface FormatConfig {
  showTime: boolean;
  showDate: boolean;
  showRoomId: boolean;
  showContext: boolean;
}

export interface LevelConfig {
  Verbose: boolean;
  Debug: boolean;
  Info: boolean;
  Warning: boolean;
  Error: boolean;
  Fatal: boolean;
}

function shortContext(context: string) {
  const a = context.split('.');
  return a[a.length - 1];
}

export const LogLine = function ({ log, format: formatConfig, level: levelConfig, index }: {
  log: RecorderLog, format: FormatConfig, level: LevelConfig, index: number, [x:string]:any
}) {
  const level = log['@l'] || 'Info';
  if (typeof levelConfig[level] == 'boolean' && !levelConfig[level]) {
    return;
  }
  const content: any[] = [];
  let useAtX = false;
  if (log['@mt']) {
    const template = log['@mt'];
    let lastIndex = 0;
    const matches = template.matchAll(/\{(.+?)\}/g);
    let match = matches.next();
    while (!match.done) {
      const before = template.substring(lastIndex, match.value.index);
      if (before.length > 0) {
        content.push(before);
      }
      if (log[match.value[1]] == '@x') useAtX = true;
      if (log[match.value[1]] !== undefined) {
        content.push(<span class={'variable'}>{
          typeof log[match.value[1]] === 'object' ? JSON.stringify(log[match.value[1]]) : log[match.value[1]]
        }</span>);
      } else if (match.value[1].startsWith('@') && log[match.value[1].substring(1)] !== undefined) {
        content.push(<span class={'variable'}>{
          typeof log[match.value[1].substring(1)] == 'object' ? JSON.stringify(log[match.value[1].substring(1)]) : log[match.value[1].substring(1)]
        }</span>);
      } else if (match.value[1].startsWith('$') && log[match.value[1].substring(1)] !== undefined) {
        content.push(<span class={'variable'}>{
          typeof log[match.value[1].substring(1)] == 'object' ? JSON.stringify(log[match.value[1].substring(1)]) : log[match.value[1].substring(1)]
        }</span>);
      } else {
        content.push(match.value[0]);
      }
      lastIndex = (match.value.index as number) + match.value[0].length;
      match = matches.next();
    }
    const rest = template.substring(lastIndex, template.length);
    if (rest.length > 0) {
      content.push(rest);
    }
    if (log['@x'] && !useAtX) {
      content.push(<span class={'variable expction'}>{log['@x'].split(/[\r\n]+/)[0]}</span>);
    }
  } else if (log['@m']) {
    content.push(log['@m']);
  } else {
    content.push('无法解析的日志');
  }

  return <div class={`log-line ${level}`} data-log-index={index}>
    {formatConfig.showTime ? <span class={'time'}>{formatConfig.showDate ? new Date(log['@t']).toLocaleString('zh-CN') : new Date(log['@t']).toLocaleTimeString('zh-CN')}</span> : null}
    <span class={'level'}>{level}</span>
    <div class={'content'}>
      {
        log['SourceContext'] && formatConfig.showContext ? <span class={'context'} title={log['SourceContext']} >[{shortContext(log['SourceContext'])}]</span> : null
      }
      {
        log['RoomId'] && formatConfig.showRoomId ? <span class={'room-id'}>{log['RoomId']}</span> : null
      }
      {content}
    </div>
  </div>;
};
