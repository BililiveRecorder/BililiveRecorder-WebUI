export const VERSION = __VERSION__ || 'dev';
export const EMBEDDED_BUILD = import.meta.env.VITE_EMBEDDED_BUILD || false;
export const DEV = import.meta.env.DEV;

export const STORAGE_KEY_SERVERS = 'brec.servers';
export const STORAGE_THEME = 'brec.theme';
export const STORAGE_LATEST_VERSION = 'brec.latestVersion';
