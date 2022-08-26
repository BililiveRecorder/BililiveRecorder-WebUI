/* eslint spaced-comment: ["error", "always", { "markers": ["/"] }] */
/// <reference types="vite/client" />
/* eslint-disable no-unused-vars */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare const __VERSION__: string;
declare const __EMBEDDED_BUILD__: boolean;
declare const __DEV__: boolean;


interface ImportMetaEnv {
  readonly VITE_EMBEDDED_BUILD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
