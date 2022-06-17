// units
const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
// convert byte to human readable size
export function byteToHuman(bytes: number): string {
  let unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  if (unitIndex < 0) {
    unitIndex = 0;
  }
  return `${(bytes / Math.pow(1024, unitIndex)).toFixed(2)} ${units[unitIndex]}`;
}
