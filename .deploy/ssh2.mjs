// SSH 执行器 v2：命令以 base64 传输，彻底绕开 shell 引号问题
// 用法: bun .deploy/ssh2.mjs -f <本地脚本文件>     # 执行脚本文件
//       bun .deploy/ssh2.mjs -c "<command>"        # 执行单条命令
import { Client } from 'ssh2';
import fs from 'node:fs';

const HOST = 'TARGET_HOST';
const PORT = 22;
const USER = 'root';
const PASS = '__DEPLOY_PASS__';

const args = process.argv.slice(2);
let script = '';
if (args[0] === '-f' && args[1]) {
  script = fs.readFileSync(args[1], 'utf8');
} else if (args[0] === '-c' && args[1]) {
  script = args[1];
} else {
  console.error('usage: bun ssh2.mjs -f <file> | -c "<cmd>"');
  process.exit(1);
}

const b64 = Buffer.from(script, 'utf8').toString('base64');
const remote = `echo '${b64}' | base64 -d | bash`;

const conn = new Client();
conn.on('ready', () => {
  conn.exec(remote, (err, stream) => {
    if (err) { console.error('EXEC_ERR', err.message); conn.end(); process.exit(1); }
    let out = '', errOut = '';
    stream.on('close', (code) => {
      if (out) process.stdout.write(out);
      if (errOut) process.stderr.write(errOut);
      console.log(`__EXIT__=${code}`);
      conn.end();
    }).on('data', (d) => { out += d.toString(); })
      .stderr.on('data', (d) => { errOut += d.toString(); });
  });
}).on('error', (e) => {
  console.error('SSH_ERR', e.message);
  process.exit(2);
}).connect({ host: HOST, port: PORT, username: USER, password: PASS, readyTimeout: 20000 });
