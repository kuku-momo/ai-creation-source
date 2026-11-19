#!/bin/bash
echo "===== sub2api 暴露的路由（从二进制里提取特征）====="
docker exec sub2api sh -c 'ls -la /app 2>/dev/null' 2>/dev/null | head -12

echo
echo "===== 用 /v1 探测常见视频端点（无 token，只看路由是否存在）====="
for p in /v1/videos /v1/videos/generations /v1/video/generations /v1/images/generations /v1/models; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:8080$p" -H 'content-type: application/json' -d '{}')
  printf '  %-28s POST -> %s\n' "$p" "$code"
done

echo
echo "===== 带假 token 探测（401=需要鉴权，404=路由不存在）====="
for p in /v1/videos /v1/video/generations /v1/images/generations; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:8080$p" -H 'content-type: application/json' -H 'authorization: Bearer sk-test' -d '{"model":"x","prompt":"y"}')
  printf '  %-28s -> %s\n' "$p" "$code"
done

echo
echo "===== sub2api 是否含视频相关字符串 ====="
string_count=$(strings /proc/$(pgrep -f sub2api | head -1)/exe 2>/dev/null | grep -ci video || echo 0)
echo "  二进制里 video 出现次数: $string_count"
