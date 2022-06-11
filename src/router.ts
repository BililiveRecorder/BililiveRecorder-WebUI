import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Blank from './views/Blank.vue';
import About from './views/About.vue';
import RecorderIndex from './views/recorder/index.vue';
import RoomList from './views/recorder/RoomList.vue';
import Settings from './views/recorder/Settings.vue';
import Home from './views/Home.vue';
import { BASE_URL, EMBEDED_BUILD } from './const';
import { recorderController } from './utils/RecorderController';


const routes: RouteRecordRaw[] = [
  { path: '/:pathMatch(.*)*', component: Blank, meta: { key: '404', allowInEmbeded: true } },
  { path: '/', component: Home, meta: { key: 'index' } },
  { path: '/about', component: About, meta: { title: '关于', key: 'about', allowInEmbeded: true } },
  { path: '/recorder/:id', name: 'Recorder', component: RecorderIndex, meta: { title: 'B站录播姬', key: 'dashboard', allowInEmbeded: true } },
  { path: '/recorder/:id/rooms', name: 'Rooms', component: RoomList, meta: { requireController: true, title: '房间列表', key: 'rooms', allowInEmbeded: true } },
  { path: '/recorder/:id/settings', name: 'Settings', component: Settings, meta: { requireController: true, title: '设置', key: 'settings', allowInEmbeded: true } },
  { path: '/recorder/:id/logs', name: 'Logs', component: Blank, meta: { requireController: true, title: '日志', key: 'logs', allowInEmbeded: true } },
  { path: '/recorder/:id/filebrowser', name: 'File Browser', component: Blank, meta: { requireController: true, title: '文件管理器', key: 'files', allowInEmbeded: true } },
  { path: '/componentsdebug', name: 'Components Debug', component: () => import('./views/ComponentsDebug.vue'), meta: { requireController: false, title: '组件调试', key: 'debug', allowInEmbeded: true } },
];

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
});
router.beforeEach(function(to, from, next) {
  if (EMBEDED_BUILD && !to.meta.allowInEmbeded) {
    return next('/recorder/local');
  }
  if (to.meta.requireController) {
    if (EMBEDED_BUILD && to.params.id !== 'local') {
      return next('/recorder/local');
    }
    recorderController.recorder == null ? next(`/recorder/${to.params.id}?target=${to.path}`) : next();
  } else {
    next();
  }
});


export default router;
