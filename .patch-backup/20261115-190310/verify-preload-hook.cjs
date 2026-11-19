'use strict';
// 用假 electron + 假页面全局对象加载真实 electron/preload.cjs，
// 触发 contextBridge.executeInMainWorld 注入的 fetch 劫持，验证页面侧看到的授权接口。
const Module = require('module');

const invocations = [];
const exposed = Object.create(null);
let hookFunc = null;

const fakeElectron = {
  contextBridge: {
    exposeInMainWorld: (name, api) => { exposed[name] = api; },
    executeInMainWorld: ({ func }) => { hookFunc = func; }
  },
  ipcRenderer: {
    invoke: async (channel, ...args) => {
      invocations.push([channel, ...args]);
      if (channel === 'license:status') {
        return { activated: true, expiresAt: null, cardName: '永久卡', cardType: 'permanent', permanent: true, serial: '0000' };
      }
      if (channel === 'license:activate') {
        return { ok: true, msg: '激活成功，永久有效', activated: true, cardName: '永久卡', cardType: 'permanent', permanent: true, expiresAt: null };
      }
      if (channel === 'license:logout') return { ok: true };
      if (channel === 'license:api-base') return '';
      return null;
    },
    on: () => {}
  }
};

const load = Module._load;
Module._load = function patched(request, parent, isMain) {
  if (request === 'electron') return fakeElectron;
  return load.call(this, request, parent, isMain);
};

global.location = { href: 'http://127.0.0.1:5173/' };
global.window = {};
global.document = { getElementById: () => null, createElement: () => ({ style: {}, querySelector: () => null, appendChild: () => {} }), documentElement: {}, body: null };
global.window.addEventListener = () => {};
const nativeCalls = [];
global.window.fetch = async (...args) => {
  nativeCalls.push(args.map(a => (typeof a === 'string' ? a : a && a.url)));
  return new Response('{"from":"native"}', { status: 200, headers: { 'content-type': 'application/json' } });
};

require('D:/Backup/Downloads/AI-Creation-Source/electron/preload.cjs');

if (!hookFunc) {
  console.error('hook 未注入');
  process.exit(1);
}

global.window.aiCreationLicense = exposed.aiCreationLicense;
hookFunc();

(async () => {
  const status = await (await window.fetch('/api/auth/status')).json();
  const activate = await (await window.fetch('/api/auth/activate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code: '乱七八糟的输入' })
  })).json();
  const logout = await (await window.fetch('/api/auth/logout', { method: 'POST' })).json();
  const business = await window.fetch('https://example.invalid/api/works');

  console.log(JSON.stringify({
    status,
    activate,
    logout,
    businessPassedToNative: business.status === 200,
    ipcChannels: invocations.map(x => x[0])
  }, null, 2));
})().catch(error => {
  console.error('FAILED', error);
  process.exitCode = 1;
});
