import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Blank from './views/Blank.vue';
import Dashboard from './views/recorder/Dashboard.vue';
import RoomList from './views/recorder/RoomList.vue';
import Settings from './views/recorder/SettingPage.vue';
import FileBrowser from './views/recorder/FileBrowser.vue';
import Home from './views/Home.vue';
import LogViewer from './views/recorder/LogViewer.vue';
import { EMBEDDED_BUILD } from './const';
import { recorderController } from './utils/RecorderController';

const routes: RouteRecordRaw[] = [
  { path: '/:pathMatch(.*)*', component: Blank, meta: { key: '404', allowInEmbedded: true } },
  { path: '/', component: Home, meta: { key: 'index' } },
  { path: '/about', component: () => import('./views/About.vue'), meta: { title: '关于', key: 'about', allowInEmbedded: true } },
  { path: '/toolbox', component: () => import('./views/toolbox/ToolboxHome.vue'), meta: { title: '工具箱', key: 'toolbox' } },
  { path: '/toolbox/sameroom', component: () => import('./views/toolbox/FindSameRoom.vue'), meta: { title: '工具箱 - 查找相同房间', key: 'toolbox' } },
  { path: '/recorder/:id', name: 'Recorder', component: Dashboard, meta: { key: 'dashboard', allowInEmbedded: true } },
  { path: '/recorder/:id/rooms', name: 'Rooms', component: RoomList, meta: { requireController: true, title: '房间列表', key: 'rooms', allowInEmbedded: true } },
  { path: '/recorder/:id/settings', name: 'Settings', component: Settings, meta: { requireController: true, title: '设置', key: 'settings', allowInEmbedded: true } },
  { path: '/recorder/:id/logs', name: 'Logs', component: LogViewer, meta: { requireController: true, title: '日志', key: 'logs', allowInEmbedded: true, blockGlobalScrollBar: true } },
  { path: '/recorder/:id/files', name: 'File Browser', component: FileBrowser, meta: { requireController: true, title: '文件管理器', key: 'files', allowInEmbedded: true } },
  { path: '/recorder/:id/player', name: 'Video Player', component: () => import('./views/recorder/VideoPlayer.vue'), meta: { requireController: true, title: '视频播放器', key: 'files', allowInEmbedded: true } },
];
if (import.meta.env.DEV) {
  routes.push({ path: '/componentsdebug', name: 'Components Debug', component: () => import('./views/ComponentsDebug.vue'), meta: { requireController: false, title: '组件调试', key: 'debug', allowInEmbedded: true } });
}

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(function (to, from, next) {
  if (EMBEDDED_BUILD && !to.meta.allowInEmbedded) {
    return next('/recorder/local');
  }
  if (to.meta.requireController) {
    if (EMBEDDED_BUILD && to.params.id !== 'local') {
      return next('/recorder/local');
    }
    recorderController.recorder == null ? next({
      path: `/recorder/${to.params.id}`,
      query: {
        target: to.fullPath,
      },
      replace: true,
    }) : next();
  } else {
    next();
  }
});
export default router;
