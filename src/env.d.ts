declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

/* eslint-disable no-unused-vars */
declare const __VERSION__: string;
declare const __BASE_URL__: string;
declare const __EMBEDED_BUILD__: boolean;
