#!/bin/bash
echo "===== A. tt2066-site.conf ====="
cat /etc/nginx/sites-enabled/tt2066-site.conf 2>/dev/null

echo
echo "===== B. tt2066-sub2api.conf ====="
cat /etc/nginx/sites-enabled/tt2066-sub2api.conf 2>/dev/null

echo
echo "===== C. sub2api 健康与对外接口 ====="
curl -s -o /dev/null -w 'localhost:8080/health  -> %{http_code}\n' http://127.0.0.1:8080/health
curl -s -o /dev/null -w 'localhost:8080/v1/models -> %{http_code}\n' http://127.0.0.1:8080/v1/models
curl -s -o /dev/null -w 'localhost:8080/         -> %{http_code}\n' http://127.0.0.1:8080/

echo
echo "===== D. 对外域名解析 ====="
getent hosts ai.tt2066.top || echo 'no-dns'

echo
echo "===== E. 数据库里有什么 ====="
docker exec sub2api-postgres psql -U postgres -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;" 2>/dev/null

echo
echo "===== F. sub2api 版本/接口探测 ====="
curl -s http://127.0.0.1:8080/api/status 2>/dev/null | head -c 400
echo
curl -s http://127.0.0.1:8080/health 2>/dev/null | head -c 300
