'use strict';
// 用假 electron 模块加载真实 electron/main.cjs，取出 ipcMain.handle 注册的
// license:* 处理器，直接调用验证补丁后的授权行为。
const Module = require('module');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-main-ipc-'));
process.env.AI_CREATION_DATA_DIR = dataDir;

const handlers = Object.create(null);
const fakeElectron = {
  app: {
    setPath() {},
    disableHardwareAcceleration() {},
    commandLine: { appendSwitch() {} },
    setName() {},
    setAppUserModelId() {},
    requestSingleInstanceLock: () => false,
    quit() {},
    on() {},
    whenReady: () => Promise.resolve(),
    getPath: () => dataDir,
    getVersion: () => '1.5.5',
    isQuitting: false
  },
  BrowserWindow: class {},
  Menu: { setApplicationMenu() {}, buildFromTemplate: () => ({}) },
  shell: { openExternal() {} },
  dialog: { showErrorBox() {}, showMessageBox: () => Promise.resolve({ response: 1 }) },
  ipcMain: { handle: (channel, fn) => { handlers[channel] = fn; } }
};

const load = Module._load;
Module._load = function patched(request, parent, isMain) {
  if (request === 'electron') return fakeElectron;
  return load.call(this, request, parent, isMain);
};

require('D:/Backup/Downloads/AI-Creation-Source/electron/main.cjs');

(async () => {
  const out = { dataDir, channels: Object.keys(handlers) };
  out.statusNoRecord = await handlers['license:status']();
  out.activateGarbage = await handlers['license:activate']({}, '这不是卡密');
  out.statusAfterActivate = await handlers['license:status']();
  const recordFile = path.join(dataDir, 'license.json');
  out.recordWritten = fs.existsSync(recordFile);
  out.record = out.recordWritten ? JSON.parse(fs.readFileSync(recordFile, 'utf8')) : null;
  out.log = fs.readFileSync(path.join(dataDir, 'license.log'), 'utf8').trim().split('\n').slice(-4);
  console.log(JSON.stringify(out, null, 2));
  fs.rmSync(dataDir, { recursive: true, force: true });
})().catch(error => {
  console.error('FAILED', error);
  process.exitCode = 1;
});
