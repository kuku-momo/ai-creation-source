const path = require('node:path');
const fs = require('node:fs');

function configuredHome() {
  try {
    if (!process.resourcesPath) throw new Error('not_packaged');
    const config = JSON.parse(fs.readFileSync(path.join(process.resourcesPath, 'home.json'), 'utf8'));
    const url = new URL(String(config.home || ''));
    if (url.username || url.password || !['https:', 'http:'].includes(url.protocol)) throw new Error('invalid_home');
    return url.href;
  } catch {
    return 'http://xumen.yxzyxm.top/';
  }
}

const HOME = configuredHome();

function isInternal(value) {
  try {
    const url = new URL(value);
    return url.origin === new URL(HOME).origin && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isExternal(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

module.exports = { HOME, isInternal, isExternal };
