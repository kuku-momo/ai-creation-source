'use strict';

/**
 * license-core.cjs —— 离线卡密内核（客户端与注册机共用同一算法）
 *
 * 卡密格式：MYAI-<T><DDD>-<SSSS>-<HHHHHHHH>
 *   T      : P = 永久卡 / D = 限时卡
 *   DDD    : 000（永久）或 001 ~ 3650（有效期天数）
 *   SSSS   : 4 位 Crockford Base32 序列号（区分卡密个体，可追溯）
 *   HHHHHHHH: 8 位 Crockford Base32 签名 = HMAC-SHA256(SECRET, MYAI|T|DDD|SSSS) 前 32 bit
 *
 * 例：MYAI-P000-7K3M-9XQ4TZ8W
 *
 * 与 tools/keygen.py 保持字节级一致：keygen 会直接从这里读取 SECRET。
 */

const crypto = require('node:crypto');

const PREFIX = 'MYAI';
const SECRET = Buffer.from(
  'AI-Creation/2026/license-core/v1:9f3c1d7a5b2e48c0a6d4f19b7e83c25d',
  'utf8'
);
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford Base32：无 I L O U

function encodeBytes(buf, chars) {
  let out = '';
  for (let i = 0; out.length < chars; i += 1) {
    const byte = buf[i % buf.length];
    out += ALPHABET[byte >> 3] + ALPHABET[byte & 31];
  }
  return out.slice(0, chars);
}

function sign(type, days, seq) {
  const padded = String(days).padStart(3, '0');
  const mac = crypto
    .createHmac('sha256', SECRET)
    .update(`${PREFIX}|${type}|${padded}|${seq}`, 'utf8')
    .digest();
  return encodeBytes(mac, 8);
}

function normalize(code) {
  return String(code == null ? '' : code)
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '');
}

function parse(code) {
  const raw = normalize(code);
  if (!raw.startsWith(PREFIX)) return null;
  const body = raw.slice(PREFIX.length);
  const match = /^([PD])(\d{3})([0-9A-Z]{4})([0-9A-Z]{8})$/.exec(body);
  if (!match) return null;
  return {
    type: match[1],
    days: Number(match[2]),
    seq: match[3],
    sig: match[4],
    canonical: `${PREFIX}-${match[1]}${match[2]}-${match[3]}-${match[4]}`
  };
}

/** 校验卡密签名与参数合法性 */
function verify(code) {
  const parsed = parse(code);
  if (!parsed) return { ok: false, reason: '卡密格式不正确' };
  const expected = sign(parsed.type, parsed.days, parsed.seq);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(parsed.sig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: '卡密无效或已被篡改' };
  }
  if (parsed.type === 'D' && (parsed.days <= 0 || parsed.days > 3650)) {
    return { ok: false, reason: '有效期超出允许范围' };
  }
  const permanent = parsed.type === 'P';
  return {
    ok: true,
    code: parsed.canonical,
    serial: parsed.seq,
    permanent,
    days: permanent ? 0 : parsed.days,
    durationMs: permanent ? 0 : parsed.days * 86400000,
    cardName: permanent ? '永久卡' : `${parsed.days} 天卡`,
    cardType: permanent ? 'permanent' : 'duration'
  };
}

/** 生成一张卡密（注册机逻辑的 JS 实现） */
function generate(options) {
  const opts = options || {};
  const type = opts.type === 'D' ? 'D' : 'P';
  const days = type === 'P' ? 0 : Math.max(1, Math.min(3650, Number(opts.days) || 30));
  let seq = String(opts.seq || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (seq.length !== 4) {
    seq = encodeBytes(crypto.randomBytes(8), 4);
  }
  return `${PREFIX}-${type}${String(days).padStart(3, '0')}-${seq}-${sign(type, days, seq)}`;
}

/** 把持久化的许可记录换算成前端 /api/auth/status 需要的结构 */
function toStatus(record) {
  const empty = {
    activated: false,
    expiresAt: null,
    cardName: null,
    cardType: null,
    permanent: false
  };
  if (!record || !record.code) return empty;
  const info = verify(record.code);
  if (!info.ok) return empty;
  if (!info.permanent) {
    const expires = record.expiresAt ? Date.parse(record.expiresAt) : 0;
    if (!expires || Date.now() >= expires) {
      return { ...empty, cardName: info.cardName, cardType: info.cardType, expired: true };
    }
    return {
      activated: true,
      expiresAt: record.expiresAt,
      cardName: info.cardName,
      cardType: info.cardType,
      permanent: false,
      serial: info.serial
    };
  }
  return {
    activated: true,
    expiresAt: null,
    cardName: info.cardName,
    cardType: 'permanent',
    permanent: true,
    serial: info.serial
  };
}

module.exports = { PREFIX, SECRET, ALPHABET, sign, normalize, parse, verify, generate, toStatus };
