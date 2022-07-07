export const VERSION = __VERSION__ || 'dev';
export const BASE_URL = import.meta.env.BASE_URL || '/';
export const EMBEDDED_BUILD = import.meta.env.VITE_EMBEDDED_BUILD || false;
export const DEV = import.meta.env.DEV;

export const STORAGE_KEY_SERVERS = 'brec.servers';
export const STORAGE_LATEST_VERSION = 'brec.latestVersion';
