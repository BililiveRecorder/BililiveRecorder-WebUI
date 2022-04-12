import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

window.__WebUI = {
  version: '__VERSION__',
  baseUrl: '__BASE_URL__'.startsWith('/') ? '__BASE_URL__' : '/',
};

createApp(App).use(router(window.__WebUI.baseUrl)).mount('#app');

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    __WebUI: {
      version: string;
      baseUrl: string;
    };
  }
}
