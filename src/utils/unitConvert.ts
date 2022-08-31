// units
const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
// convert byte to human readable size
export function byteToHuman(bytes: number): string {
  let unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  if (unitIndex < 0) {
    unitIndex = 0;
  }
  let num = (bytes / Math.pow(1024, unitIndex)).toFixed(2).slice(0, 4);
  if (num[num.length - 1] == '.')num = num.slice(0, 3);
  return `${num} ${units[unitIndex]}`;
}

export function msToHuman(ms: number, includeMs: boolean = false): string {
  const time = [0, 0, 0, 0, 0];
  time[0] = Math.floor(ms / 1000 / 60 / 60 / 24);
  time[1] = Math.floor((ms / 1000 / 60 / 60) % 24);
  time[2] = Math.floor((ms / 1000 / 60) % 60);
  time[3] = Math.floor((ms / 1000) % 60);
  time[4] = Math.floor(ms % 1000);
  return (
    (time[0] > 0 ? time[0] + ':' : '') +
    (time[1] > 9 ? time[1] : '0' + time[1]) + ':' +
    (time[2] > 9 ? time[2] : '0' + time[2]) + ':' +
    (time[3] > 9 ? time[3] : '0' + time[3]) +
    (includeMs ? '.' + time[4] : '')
  );
}

export function dateToTimeWithMs(date: Date): string {
  return `${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}:${date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds()}.${date.getMilliseconds()}`;
}
