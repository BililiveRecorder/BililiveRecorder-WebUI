// generate server icon in svg format

import { createElementBlock, defineComponent, openBlock } from 'vue';
import { Server } from './RecorderController';

export function generateServerIcon(server: Server) {
  const bgcolor = parseInt(server.id, 36).toString(16).slice(0, 6);
  const r = ((18 - parseInt(bgcolor.slice(0, 1), 16)) % 16).toString(16);
  const g = ((18 - parseInt(bgcolor.slice(2, 3), 16)) % 16).toString(16);
  const b = ((18 - parseInt(bgcolor.slice(4, 5), 16)) % 16).toString(16);
  const textColor = r + g + b;
  const component = defineComponent({
    name: `server-icon-${server.id}`,
    render: function render() {
      return openBlock(), createElementBlock('svg', {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'viewBox': '0 0 512 512',
      }, [
        createElementBlock('circle', { cx: '256', cy: '256', r: '256', fill: '#' + bgcolor }),
        createElementBlock('text', { x: 256, y: 256, fill: '#' + textColor, style: 'text-anchor:middle;dominant-baseline:middle;font-size:400;font-style:normal' }, server.name[0].toUpperCase()),
      ]);
    },
  });
  return component;
}
