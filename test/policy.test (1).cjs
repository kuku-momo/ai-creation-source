'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { HOME, isInternal, isExternal } = require(path.join(__dirname, '..', 'electron', 'policy.cjs'));

test('HOME 在非打包环境回落到内置站点', () => {
  // 直接用 node 跑时没有 process.resourcesPath，走 catch 分支
  assert.equal(HOME, 'http://xumen.yxzyxm.top/');
});

test('isInternal 只认同源', () => {
  assert.equal(isInternal('http://xumen.yxzyxm.top/'), true);
  assert.equal(isInternal('http://xumen.yxzyxm.top/drama?x=1'), true);
  assert.equal(isInternal('https://xumen.yxzyxm.top/'), false, '协议不同不算同源');
  assert.equal(isInternal('http://evil.xumen.yxzyxm.top/'), false);
  assert.equal(isInternal('http://xumen.yxzyxm.top.evil.com/'), false);
  assert.equal(isInternal('javascript:alert(1)'), false);
  assert.equal(isInternal('not a url'), false);
});

test('isInternal 拒绝带凭据的 URL', () => {
  assert.equal(isInternal('http://user:pass@xumen.yxzyxm.top/'), false);
});

test('isExternal 只放行 http/https 且不带凭据', () => {
  assert.equal(isExternal('https://example.com/a'), true);
  assert.equal(isExternal('http://example.com:8080/a'), true);
  assert.equal(isExternal('file:///C:/Windows/system32/calc.exe'), false);
  assert.equal(isExternal('mailto:a@b.c'), false);
  assert.equal(isExternal('https://user:pass@example.com/'), false);
});
