/**
 * 前端入口
 *
 * 说明：runtime/index.js 是从线上 Vite 产物还原出来的共享层（Vue 运行时 + vue-router
 * + 应用外壳 App + 路由表）。页面组件在 src/views/*.js，样式在 src/styles/**。
 *
 * App 外壳内部自己带了「卡密激活 / 落地页 / 侧边栏 / router-view」，
 * 路由表也在 runtime 里（与线上完全一致），所以这里只做挂载。
 */
import './styles/base.css';
import { App, router, createApp } from './runtime/index.js';

const app = createApp(App);
app.use(router);
app.mount('#app');

// 纯浏览器调试（npm run dev）时没有 Electron preload，补一个本地兜底，
// 避免 /api/auth/status 直接打到 vite 代理而报错。
if (!window.aiCreationLicense) {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  const nativeFetch = window.fetch.bind(window);
  window.aiCreationLicense = {
    status: () =>
      nativeFetch('/api/auth/status')
        .then((r) => r.json())
        .catch(() => ({ activated: false })),
    activate: (code) =>
      nativeFetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then((r) => r.json())
        .catch(() => ({ ok: false, msg: '本地网关未启动' })),
    logout: () => nativeFetch('/api/auth/logout', { method: 'POST' }).then(() => ({ ok: true })),
    apiBase: () => Promise.resolve(''),
  };
  void json;
}
