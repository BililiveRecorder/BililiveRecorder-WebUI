import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Blank from './views/Blank.vue';
import About from './views/About.vue';
import RoomList from './views/RoomList.vue';
import Settings from './views/Settings.vue';
import Home from './views/Home.vue';

const routes: RouteRecordRaw[] = [
  { path: '/:pathMatch(.*)*', component: Blank },
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/rooms', name: 'Rooms', component: RoomList },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/logs', name: 'Logs', component: Blank },
  { path: '/filebrowser', name: 'File Browser', component: Blank },
];
export const router = createRouter({
  history: createWebHistory(),
  routes,
});
