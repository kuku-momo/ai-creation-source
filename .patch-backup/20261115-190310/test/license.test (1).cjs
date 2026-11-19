'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const core = require(path.join(__dirname, '..', 'electron', 'license-core.cjs'));

test('生成的永久卡可通过校验', () => {
  for (let i = 0; i < 20; i += 1) {
    const code = core.generate({ type: 'P' });
    assert.match(code, /^MYAI-P000-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{8}$/);
    const info = core.verify(code);
    assert.equal(info.ok, true, info.reason);
    assert.equal(info.permanent, true);
    assert.equal(info.cardName, '永久卡');
  }
});

test('限时卡天数进入签名，且范围受约束', () => {
  const code = core.generate({ type: 'D', days: 90, seq: 'ABCD' });
  const info = core.verify(code);
  assert.equal(info.ok, true);
  assert.equal(info.days, 90);
  assert.equal(info.durationMs, 90 * 86400000);
  assert.equal(info.cardName, '90 天卡');

  // 改天数会破坏签名
  const tampered = code.replace('-D090-', '-D365-');
  assert.equal(core.verify(tampered).ok, false);

  assert.equal(core.verify(core.generate({ type: 'D', days: 0 })).ok, true, '下限被夹到 1 天');
  assert.equal(core.verify(core.generate({ type: 'D', days: 999 })).days, 999, '999 天是上限内的最长卡');
  // 已知缺陷（保留上游行为）：DDD 只有 3 位，3650 天会被拼成 4 位而无法解析
  assert.equal(core.verify(core.generate({ type: 'D', days: 3650 })).ok, false, '3650 天无法编码，见 docs/BUGS.md');
});

test('签名大小写/分隔符不敏感，但内容不可篡改', () => {
  const code = core.generate({ type: 'P', seq: '7K3M' });
  const messy = code.toLowerCase().replace(/-/g, ' ');
  assert.equal(core.verify(messy).ok, true);

  const flipped = code.slice(0, -1) + (code.slice(-1) === 'A' ? 'B' : 'A');
  assert.equal(core.verify(flipped).ok, false);
});

test('拒绝非法格式与低熵输入', () => {
  for (const bad of ['', 'MYAI', 'MYAI-P000-7K3M', 'MYAI-X000-7K3M-9XQ4TZ8W', 'hello world', null]) {
    assert.equal(core.verify(bad).ok, false);
  }
});

test('toStatus 处理未激活 / 永久 / 过期三种状态', () => {
  assert.deepEqual(core.toStatus(null), {
    activated: false,
    expiresAt: null,
    cardName: null,
    cardType: null,
    permanent: false,
  });

  const permanent = core.toStatus({ code: core.generate({ type: 'P', seq: 'AAAA' }) });
  assert.equal(permanent.activated, true);
  assert.equal(permanent.permanent, true);
  assert.equal(permanent.expiresAt, null);

  const future = new Date(Date.now() + 86400000).toISOString();
  const active = core.toStatus({ code: core.generate({ type: 'D', days: 30, seq: 'BBBB' }), expiresAt: future });
  assert.equal(active.activated, true);
  assert.equal(active.expiresAt, future);

  const past = new Date(Date.now() - 86400000).toISOString();
  const expired = core.toStatus({ code: core.generate({ type: 'D', days: 30, seq: 'CCCC' }), expiresAt: past });
  assert.equal(expired.activated, false);
  assert.equal(expired.expired, true);
});

test('toStatus 不接受被篡改的记录', () => {
  const code = core.generate({ type: 'P', seq: 'DDDD' });
  const broken = code.slice(0, -2) + 'ZZ';
  assert.equal(core.toStatus({ code: broken }).activated, false);
});
