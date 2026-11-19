#!/bin/bash
echo "===== 带假 token 看 /v1/videos 的响应体（能判断是否真支持视频）====="
curl -s -X POST "http://127.0.0.1:8080/v1/videos" \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer sk-test' \
  -d '{"model":"kling-v1","prompt":"a cat"}' | head -c 500
echo
echo "---"
curl -s -X GET "http://127.0.0.1:8080/v1/videos" \
  -H 'authorization: Bearer sk-test' | head -c 300

echo
echo "===== /v1/images/generations 响应体 ====="
curl -s -X POST "http://127.0.0.1:8080/v1/images/generations" \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer sk-test' \
  -d '{"model":"gpt-image-1","prompt":"a cat"}' | head -c 400

echo
echo "===== sub2api 里的视频/图像渠道类型 ====="
ls -1 /opt/sub2api/deploy/data 2>/dev/null
echo "--- 数据目录结构 ---"
find /opt/sub2api/deploy/data -maxdepth 2 -type d 2>/dev/null | head -12
