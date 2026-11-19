const { contextBridge, ipcRenderer } = require('electron');

/* ==========================================================================
 * [PATCH] 许可桥 + 主世界 fetch 劫持
 *
 * 页面（Vue SPA）在挂载时只认两个结果：
 *   GET  /api/auth/status   -> { activated, cardName, permanent, expiresAt }
 *   POST /api/auth/activate -> { ok, msg, cardName, permanent, expiresAt }
 * 这里把这两个端点整体接管到主进程的离线卡密内核，业务接口可选改道本地网关。
 * ========================================================================== */
contextBridge.exposeInMainWorld('aiCreationLicense', {
  status: () => ipcRenderer.invoke('license:status'),
  activate: code => ipcRenderer.invoke('license:activate', String(code || '')),
  logout: () => ipcRenderer.invoke('license:logout'),
  apiBase: () => ipcRenderer.invoke('license:api-base')
});

function licenseHook() {
  const api = window.aiCreationLicense;
  if (!api || window.__aiCreationLicenseHooked) return;
  window.__aiCreationLicenseHooked = true;

  const json = (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });

  const toUrl = input => {
    try {
      if (typeof input === 'string') return new URL(input, location.href);
      if (input && typeof input.url === 'string') return new URL(input.url, location.href);
    } catch { /* ignore */ }
    return null;
  };

  let baseValue = null;
  let basePromise = null;
  const apiBase = () => {
    if (baseValue !== null) return Promise.resolve(baseValue);
    if (!basePromise) {
      basePromise = Promise.resolve()
        .then(() => api.apiBase())
        .then(value => { baseValue = String(value || ''); return baseValue; })
        .catch(() => { baseValue = ''; return ''; });
    }
    return basePromise;
  };

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async function patchedFetch(input, init) {
    const url = toUrl(input);
    const pathname = url ? url.pathname : '';

    if (pathname === '/api/auth/status') {
      return json(await api.status());
    }

    if (pathname === '/api/auth/activate') {
      let code = '';
      try {
        const body = init && init.body;
        if (typeof body === 'string') code = JSON.parse(body).code || '';
        else if (body && typeof body.get === 'function') code = body.get('code') || '';
      } catch { /* ignore */ }
      const result = await api.activate(code);
      return json(result, result && result.ok ? 200 : 400);
    }

    if (pathname === '/api/auth/logout') {
      await api.logout();
      return json({ ok: true });
    }

    const base = url && pathname.startsWith('/api/') ? await apiBase() : '';
    if (base) {
      // 改道到本地网关属于跨源请求：必须显式带上 credentials，
      // 否则后台会话（Set-Cookie: admin_session）不会被浏览器保存，每次刷新都退回登录页。
      const target = base + pathname + (url.search || '');
      const options = { ...(init || {}), credentials: 'include' };
      const request = typeof input === 'string' ? new Request(target, options) : new Request(target, options);
      return nativeFetch(request);
    }

    return nativeFetch(input, init);
  };
}

function installLicenseHook() {
  try {
    if (typeof contextBridge.executeInMainWorld === 'function') {
      contextBridge.executeInMainWorld({ func: licenseHook });
    } else {
      // 老版本兜底：preload 与页面同世界时可直接执行
      licenseHook();
    }
  } catch (error) {
    console.error('[license] hook 注入失败', error);
  }
}

installLicenseHook();

function mountUpdateNotice(update) {
  if (!update?.version || document.getElementById('ai-creation-update-notice')) return;
  const notice = document.createElement('div');
  notice.id = 'ai-creation-update-notice';
  notice.innerHTML = '<span class="ai-creation-update-text"></span><button type="button">立即下载</button><button type="button" class="ai-creation-update-close" aria-label="关闭">×</button>';
  notice.querySelector('.ai-creation-update-text').textContent = `发现新版本 v${update.version}`;
  const style = document.createElement('style');
  style.textContent = `#ai-creation-update-notice{position:fixed;top:16px;right:18px;z-index:2147483647;display:flex;align-items:center;gap:10px;padding:10px 12px 10px 14px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:#20242b;color:#f5f7fa;box-shadow:0 8px 28px rgba(0,0,0,.28);font:13px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#ai-creation-update-notice button{border:0;border-radius:7px;padding:6px 10px;background:#4f8cff;color:#fff;cursor:pointer;font:inherit}#ai-creation-update-notice button:hover{background:#6a9cff}#ai-creation-update-notice .ai-creation-update-close{padding:2px 5px;background:transparent;color:#aab2c0;font-size:18px;line-height:1}#ai-creation-update-notice .ai-creation-update-close:hover{color:#fff;background:rgba(255,255,255,.1)}`;
  document.documentElement.appendChild(style);
  document.body.appendChild(notice);
  notice.querySelector('button:not(.ai-creation-update-close)').addEventListener('click', () => {
    ipcRenderer.invoke('open-update-download').catch(() => {});
  });
  notice.querySelector('.ai-creation-update-close').addEventListener('click', () => notice.remove());
}

function handleUpdate(update) {
  if (document.body) mountUpdateNotice(update);
  else window.addEventListener('DOMContentLoaded', () => mountUpdateNotice(update), { once: true });
}

ipcRenderer.on('update-available', (_event, update) => handleUpdate(update));

contextBridge.exposeInMainWorld('doubaoAgent', {
  pair: code => ipcRenderer.invoke('doubao-agent-pair', String(code || '')),
  openAccount: profileId => ipcRenderer.invoke('doubao-agent-open-account', String(profileId || 'legacy')),
  accountStatus: profileId => ipcRenderer.invoke('doubao-agent-account-status', String(profileId || 'legacy'))
});

contextBridge.exposeInMainWorld('aiCreationUpdater', {
  check: () => ipcRenderer.invoke('check-for-updates')
});
