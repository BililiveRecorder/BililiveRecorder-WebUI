import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Blank from './views/Blank.vue';
import About from './views/About.vue';
import RoomList from './views/RoomList.vue';
import Settings from './views/Settings.vue';

const routes: RouteRecordRaw[] = [
  { path: '/:pathMatch(.*)*', component: Blank },
  { path: '/', component: Blank },
  { path: '/about', component: About },
  { path: '/room-list', name: 'RoomList', component: RoomList },
  { path: '/settings', name: 'Settings', component: Settings },
];
export const router = createRouter({
  history: createWebHistory(),
  routes,
});
