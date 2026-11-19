'use strict';

/**
 * ai-gateway.cjs —— 本地 API 网关
 *
 * 作用：真服务器的所有业务接口都做过 `未激活` 会话校验（403），客户端补丁把
 *      /api/* 改道到这里，由本网关于本机应答，使界面完全可用。
 *
 * 由 main.cjs 通过 fork 自动拉起，监听 127.0.0.1:<gatewayPort>。
 * 环境变量：
 *   AI_GATEWAY_PORT            监听端口
 *   AI_GATEWAY_DATA_DIR        数据目录（JSON 落盘）
 *   AI_GATEWAY_LICENSE_MODULE  license-core.cjs 路径
 *   AI_GATEWAY_LICENSE_FILE    license.json 路径
 *   AI_GATEWAY_LOG             访问日志
 *   AI_GATEWAY_DEMO_BASE       演示视频域名（默认取 home.json）
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// [LOCAL] 业务路由扩展（对话/绘画/作品/任务聚合/重制/电商/剧本工具/豆包台账）
let extraRoutes = null;
try {
  extraRoutes = require('./routes-extra.cjs');
} catch (error) {
  console.error(`[gateway] routes-extra 加载失败: ${error.message}`);
}

const PORT = Number(process.env.AI_GATEWAY_PORT || 8787);
const DATA_DIR = process.env.AI_GATEWAY_DATA_DIR || path.join(process.cwd(), 'data');
const LICENSE_FILE = process.env.AI_GATEWAY_LICENSE_FILE || '';
const LOG_FILE = process.env.AI_GATEWAY_LOG || '';
const DB_FILE = path.join(DATA_DIR, 'db.json');

let license = null;
try {
  license = require(process.env.AI_GATEWAY_LICENSE_MODULE || './license-core.cjs');
} catch (error) {
  console.error(`[gateway] license-core 加载失败: ${error.message}`);
}

fs.mkdirSync(DATA_DIR, { recursive: true });

function loadDb() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch {
    return { settings: { apiBase: 'https://api.lk888.ai', apiKey: '', models: { chat: [], image: [], video: [] } }, tasks: [], works: [], drama: [], shortDrama: [], uploads: [] };
  }
}

let db = loadDb();
function saveDb() {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

function log(text) {
  const line = `${new Date().toISOString()} ${text}\n`;
  try { if (LOG_FILE) fs.appendFileSync(LOG_FILE, line, 'utf8'); } catch { /* ignore */ }
  process.stdout.write(text + '\n');
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With,Accept',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function send(res, status, data, origin) {
  const body = Buffer.from(JSON.stringify(data), 'utf8');
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
    ...corsHeaders(origin)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 80 * 1024 * 1024) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const raw = await readBody(req);
  if (!raw.length) return {};
  try { return JSON.parse(raw.toString('utf8')); } catch { return {}; }
}

function readLicenseRecord() {
  try { return JSON.parse(fs.readFileSync(LICENSE_FILE, 'utf8')); } catch { return null; }
}

const GRANTED_STATUS = {
  activated: true,
  expiresAt: null,
  cardName: '永久卡',
  cardType: 'permanent',
  permanent: true,
  serial: '0000'
};

function licenseStatus() {
  // 授权校验已移除：许可模块缺失时也放行，不再回 403 语义的未激活状态
  if (!license) return { ...GRANTED_STATUS };
  return license.toStatus(readLicenseRecord());
}

function demoBase() {
  if (process.env.AI_GATEWAY_DEMO_BASE) return process.env.AI_GATEWAY_DEMO_BASE.replace(/\/$/, '');
  try {
    const home = JSON.parse(fs.readFileSync(path.join(process.resourcesPath || '', 'home.json'), 'utf8'));
    return new URL(home.home).origin;
  } catch {
    return 'https://khd.yxzyxm.top';
  }
}

function nextId(prefix) {
  return `${prefix}${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
}

/* ---------------------------------------------------------------- 视频任务 */
const DEMO_VIDEOS = ['/media/login-demo-01.mp4', '/media/login-demo-02.mp4', '/media/login-demo-03.mp4', '/media/login-demo-04-v2.mp4'];

function scheduleTask(task) {
  setTimeout(() => {
    task.status = 'generating';
    task.updated_at = new Date().toISOString();
    saveDb();
  }, 4000);
  setTimeout(() => {
    task.status = 'success';
    task.progress = 100;
    task.video_url = demoBase() + DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
    task.updated_at = new Date().toISOString();
    saveDb();
    log(`[task] ${task.id} success`);
  }, 12000);
}

/* -------------------------------------------------------------------- 路由 */
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '*';
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (pathname.startsWith('/api/')) log(`${method} ${pathname}`);

  try {
    /* ---- 授权（与 preload 内的本地实现同源，供浏览器直连时使用） ---- */
    if (pathname === '/api/health') return send(res, 200, { ok: true, name: 'ai-creation-local-gateway', mode: 'local', time: new Date().toISOString() }, origin);

    if (pathname === '/api/auth/status' && method === 'GET') return send(res, 200, licenseStatus(), origin);

    if (pathname === '/api/auth/activate' && method === 'POST') {
      const body = await readJson(req);
      const info = license
        ? license.verify(body.code)
        : { ok: true, code: '', serial: '0000', permanent: true, days: 0, durationMs: 0, cardName: '永久卡', cardType: 'permanent' };
      if (!info.ok) return send(res, 400, { ok: false, msg: info.reason, activated: false }, origin);
      const activatedAt = new Date();
      const record = {
        code: info.code,
        serial: info.serial,
        cardName: info.cardName,
        permanent: info.permanent,
        activatedAt: activatedAt.toISOString(),
        expiresAt: info.permanent ? null : new Date(activatedAt.getTime() + info.durationMs).toISOString()
      };
      try { fs.writeFileSync(LICENSE_FILE, JSON.stringify(record, null, 2), 'utf8'); } catch { /* ignore */ }
      return send(res, 200, { ok: true, msg: '激活成功', activated: true, cardName: info.cardName, permanent: info.permanent, expiresAt: record.expiresAt }, origin);
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      try { fs.unlinkSync(LICENSE_FILE); } catch { /* ignore */ }
      return send(res, 200, { ok: true }, origin);
    }

    /* ---- 设置 ---- */
    if (pathname === '/api/settings' && method === 'GET') {
      const s = db.settings || {};
      return send(res, 200, {
        apiBase: s.apiBase || 'https://api.lk888.ai',
        apiKeyMasked: s.apiKey ? `${s.apiKey.slice(0, 6)}****${s.apiKey.slice(-4)}` : '',
        models: s.models || { chat: [], image: [], video: [] },
        testResult: s.testResult || null
      }, origin);
    }
    if (pathname === '/api/settings' && (method === 'PUT' || method === 'POST')) {
      const body = await readJson(req);
      db.settings = { ...(db.settings || {}), ...body };
      if (body.apiKey) db.settings.apiKeyMasked = `${body.apiKey.slice(0, 6)}****${body.apiKey.slice(-4)}`;
      saveDb();
      return send(res, 200, { ok: true }, origin);
    }
    if (pathname === '/api/settings/test' && method === 'POST') {
      const body = await readJson(req);
      const result = { ok: true, apiBase: body.apiBase || db.settings?.apiBase || '', models: (db.settings?.models || { chat: [], image: [], video: [] }), message: '本地网关：连通性检查已跳过（未配置真实上游）' };
      db.settings = { ...(db.settings || {}), testResult: result };
      saveDb();
      return send(res, 200, result, origin);
    }

    /* ---- 视频 ---- */
    if (pathname === '/api/video/models' && method === 'GET') {
      return send(res, 200, {
        models: [
          { id: 'local-demo', name: '本地演示模型（占位）', billing: '免费', billing_position: 'after' },
          { id: 'local-hd', name: '本地高清演示（占位）', billing: '免费', billing_position: 'after' }
        ]
      }, origin);
    }
    if (pathname === '/api/video/generate' && method === 'POST') {
      const body = await readJson(req);
      const task = {
        id: nextId('task_'),
        status: 'pending',
        progress: 0,
        model: body.model || 'local-demo',
        prompt: String(body.prompt || '').slice(0, 4000),
        params: body.params || {},
        video_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.tasks = db.tasks || [];
      db.tasks.unshift(task);
      saveDb();
      scheduleTask(task);
      return send(res, 200, { ok: true, id: task.id, task }, origin);
    }
    if (pathname === '/api/video/tasks' && method === 'GET') {
      return send(res, 200, { tasks: (db.tasks || []).slice(0, 50) }, origin);
    }
    const videoTaskMatch = /^\/api\/video\/tasks\/([^/]+)$/.exec(pathname);
    if (videoTaskMatch && method === 'DELETE') {
      db.tasks = (db.tasks || []).filter(t => t.id !== decodeURIComponent(videoTaskMatch[1]));
      saveDb();
      return send(res, 200, { ok: true }, origin);
    }

    /* ---- 短剧 / 剧本 ---- */
    if (pathname === '/api/drama/projects' && method === 'GET') {
      return send(res, 200, { ok: true, projects: db.drama || [] }, origin);
    }
    if (pathname === '/api/drama/projects' && method === 'POST') {
      const body = await readJson(req);
      const project = { id: nextId('drama_'), ...body, created_at: new Date().toISOString() };
      db.drama = db.drama || [];
      db.drama.unshift(project);
      saveDb();
      return send(res, 200, { ok: true, id: project.id, project }, origin);
    }

    if (pathname === '/api/short-drama-production/projects' && method === 'GET') {
      return send(res, 200, { ok: true, projects: db.shortDrama || [] }, origin);
    }
    if (pathname === '/api/short-drama-production/projects' && method === 'POST') {
      const body = await readJson(req);
      const project = { id: nextId('sd_'), ...body, created_at: new Date().toISOString() };
      db.shortDrama = db.shortDrama || [];
      db.shortDrama.unshift(project);
      saveDb();
      return send(res, 200, { ok: true, id: project.id, project }, origin);
    }
    const sdMatch = /^\/api\/short-drama-production\/projects\/([^/]+)$/.exec(pathname);
    if (sdMatch) {
      const id = decodeURIComponent(sdMatch[1]);
      const index = (db.shortDrama || []).findIndex(p => p.id === id);
      if (method === 'GET') {
        if (index < 0) return send(res, 404, { ok: false, msg: '项目不存在' }, origin);
        return send(res, 200, { ok: true, project: db.shortDrama[index] }, origin);
      }
      if (method === 'DELETE') {
        db.shortDrama = (db.shortDrama || []).filter(p => p.id !== id);
        saveDb();
        return send(res, 200, { ok: true }, origin);
      }
      if (method === 'PUT' || method === 'PATCH') {
        const body = await readJson(req);
        if (index >= 0) { db.shortDrama[index] = { ...db.shortDrama[index], ...body }; saveDb(); }
        return send(res, 200, { ok: true }, origin);
      }
    }

    if (pathname === '/api/short-drama-production/source/import' && method === 'POST') {
      const raw = await readBody(req);
      const contentType = String(req.headers['content-type'] || '');
      let filename = 'script.txt';
      let text = '';
      const nameMatch = /filename="([^"]+)"/.exec(raw.toString('latin1').slice(0, 4096));
      if (nameMatch) filename = nameMatch[1];
      const ext = (filename.split('.').pop() || '').toLowerCase();
      if (ext === 'txt' || ext === 'md') {
        const boundary = /boundary=([^;]+)/.exec(contentType);
        if (boundary) {
          const parts = raw.toString('utf8').split(`--${boundary[1]}`);
          const filePart = parts.find(p => p.includes('filename='));
          if (filePart) {
            const split = filePart.indexOf('\r\n\r\n');
            if (split >= 0) {
              text = filePart.slice(split + 4).replace(/\r\n--\s*$/, '').trim();
            }
          }
        }
      }
      if (!text) {
        text = `【本地网关占位】已接收文件 ${filename}。\n\n当前为本地模式，未接入 DOC/DOCX/PDF 解析服务，请把剧本内容直接粘贴到文本框，或接入自己的解析服务。`;
      }
      const chapters = Math.max(1, (text.match(/第[一二三四五六七八九十百零\d]+[集章]/g) || []).length);
      return send(res, 200, { ok: true, text, filename, chapters }, origin);
    }

    /* ---- 上传 ---- */
    if (pathname === '/api/uploads/oss/video' && method === 'POST') {
      const raw = await readBody(req);
      const id = nextId('up_');
      const file = path.join(DATA_DIR, `${id}.bin`);
      fs.writeFileSync(file, raw);
      db.uploads = db.uploads || [];
      db.uploads.push({ id, bytes: raw.length, created_at: new Date().toISOString() });
      saveDb();
      log(`[upload] ${id} ${raw.length} bytes`);
      return send(res, 200, { ok: true, id, url: `/api/uploads/local/${id}`, bytes: raw.length }, origin);
    }
    const upMatch = /^\/api\/uploads\/local\/([^/]+)$/.exec(pathname);
    if (upMatch) {
      const file = path.join(DATA_DIR, `${upMatch[1]}.bin`);
      if (!fs.existsSync(file)) return send(res, 404, { ok: false }, origin);
      const data = fs.readFileSync(file);
      res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': data.length, ...corsHeaders(origin) });
      return res.end(data);
    }

    /* ---- 其它 ---- */
    if (pathname === '/api/tutorials' && method === 'GET') return send(res, 200, { ok: true, tutorials: [] }, origin);
    if (pathname === '/api/site/card-claim' && method === 'GET') {
      return send(res, 200, { ok: true, config: { enabled: false, wechat: '', qrImage: '', description: '本地模式：卡密由 keygen 生成', serviceHours: '' } }, origin);
    }

    // [LOCAL] 扩展路由：命中即返回，未命中落到下面的兜底
    if (extraRoutes) {
      const handled = await extraRoutes.handle({
        req, res, pathname, method, origin, db, saveDb, log, send, readJson, readBody,
        corsHeaders, demoBase, licenseStatus
      });
      if (handled) return handled;
    }

    log(`[gateway] 未实现 ${method} ${pathname}`);
    return send(res, 200, { ok: true, local: true, note: `本地网关未实现 ${method} ${pathname}` }, origin);
  } catch (error) {
    log(`[gateway] error ${method} ${pathname}: ${error.stack || error.message}`);
    return send(res, 500, { ok: false, msg: error.message }, origin);
  }
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[gateway] 端口 ${PORT} 被占用，改用随机端口`);
    server.listen(0, '127.0.0.1');
  } else {
    console.error(`[gateway] ${error.message}`);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const actual = server.address().port;
  log(`[gateway] listening http://127.0.0.1:${actual} data=${DATA_DIR}`);
  if (process.send) process.send({ type: 'gateway-port', port: actual });
});
