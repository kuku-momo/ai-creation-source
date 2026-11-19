// SSH 执行器：bun + ssh2，密码认证
// 用法: bun .deploy/ssh.mjs "<command>"
import { Client } from 'ssh2';

const HOST = 'TARGET_HOST';
const PORT = 22;
const USER = 'root';
const PASS = '__DEPLOY_PASS__';

const command = process.argv[2];
if (!command) {
  console.error('usage: bun ssh.mjs "<command>"');
  process.exit(1);
}

const conn = new Client();
conn.on('ready', () => {
  conn.exec(command, (err, stream) => {
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
