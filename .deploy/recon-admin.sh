#!/bin/bash
# 服务器侧后台攻击面侦察
echo "===== 1. 隐藏后台路径是否真的可达 ====="
for p in /tt-admin-9f4c2a7d1e6b8c3a/ /tt-admin-9f4c2a7d1e6b8c3a/login /admin /admin/ /hap-api/ /v1/models; do
  code=$(curl -sk -o /dev/null -w '%{http_code}' "https://127.0.0.1$p" -H "Host: ai.tt2066.top" -H 'User-Agent: Mozilla/5.0')
  printf '  %-34s -> %s\n' "$p" "$code"
done

echo
echo "===== 2. 隐藏后台响应头（识别应用与版本）====="
curl -sk -D - -o /dev/null "https://127.0.0.1/tt-admin-9f4c2a7d1e6b8c3a/" -H "Host: ai.tt2066.top" | head -20

echo
echo "===== 3. 18443 上跑的是什么 ====="
ss -ltnp | grep 18443 || echo "  未监听 18443"
ps -p $(ss -ltnp 2>/dev/null | grep 18443 | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2) -o comm=,args= 2>/dev/null | head -c 300

echo
echo "===== 4. sub2api 后台登录端点探测 ====="
for p in /api/auth/login /api/login /login /api/user/login /api/auth/signin; do
  code=$(curl -sk -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:8080$p" -H 'content-type: application/json' -d '{"email":"x","password":"y"}')
  printf '  %-24s -> %s\n' "$p" "$code"
done

echo
echo "===== 5. sub2api 健康/版本 ====="
curl -s http://127.0.0.1:8080/health
echo
curl -s http://127.0.0.1:8080/api/status 2>/dev/null | head -c 200
