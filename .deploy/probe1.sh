#!/bin/bash
echo "===== 1. 容器全景 ====="
docker ps -a --format '{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'

echo
echo "===== 2. 端口映射 ====="
docker ps --format '{{.Names}} => {{.Ports}}'

echo
echo "===== 3. sub2api 是什么 ====="
docker inspect sub2api --format '{{.Config.Image}}' 2>/dev/null
docker inspect sub2api --format '{{range $k,$v := .Config.Env}}{{$k}}={{$v}}
{{end}}' 2>/dev/null | grep -v -i -E 'password|secret|key|token' | head -20

echo
echo "===== 4. 数据卷/挂载 ====="
docker inspect sub2api --format '{{range .Mounts}}{{.Type}} {{.Source}} -> {{.Destination}}
{{end}}' 2>/dev/null

echo
echo "===== 5. nginx 站点 ====="
ls -1 /etc/nginx/sites-enabled/ 2>/dev/null
grep -rh 'server_name' /etc/nginx/sites-enabled/ 2>/dev/null | head -10

echo
echo "===== 6. 8080 是谁 ====="
docker ps --filter 'publish=8080' --format '{{.Names}} {{.Image}}'

echo
echo "===== 7. 磁盘与内存余量 ====="
df -h / | tail -1
free -m | sed -n '2p'
