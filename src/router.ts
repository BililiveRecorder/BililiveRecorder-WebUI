import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Blank from './views/Blank.vue';
import About from './views/About.vue';
import RoomList from './views/RoomList.vue';
import Settings from './views/Settings.vue';
import Home from './views/Home.vue';
import { BASE_URL } from './const';


const routes: RouteRecordRaw[] = [
  { path: '/:pathMatch(.*)*', component: Blank },
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/rooms', name: 'Rooms', component: RoomList, meta: { requireController: true } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { requireController: true } },
  { path: '/logs', name: 'Logs', component: Blank, meta: { requireController: true } },
  { path: '/filebrowser', name: 'File Browser', component: Blank, meta: { requireController: true } },
];

export const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
});

