import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

createApp(App).use(router).mount('#app');

window.WebUI = {
  version: '{{version}}',
};

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    WebUI: {
      version: string;
    };
  }
}
