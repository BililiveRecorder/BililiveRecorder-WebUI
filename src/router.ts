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
  { path: '/about', component: About, meta: { title: '关于' } },
  { path: '/rooms', name: 'Rooms', component: RoomList, meta: { requireController: true, title: '房间列表' } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { requireController: true, title: '设置' } },
  { path: '/logs', name: 'Logs', component: Blank, meta: { requireController: true, title: '日志' } },
  { path: '/filebrowser', name: 'File Browser', component: Blank, meta: { requireController: true, title: '文件管理器' } },
];

export const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
});

