#!/bin/bash
echo "===== 1. 应用目录 ====="
ls -la /opt/hap/app/ 2>/dev/null | head -20
echo
echo "===== 2. 源码规模 ====="
wc -l /opt/hap/app/*.py 2>/dev/null | tail -5
echo
echo "===== 3. 关键目录 ====="
for d in /opt/hap/data /opt/hap/secrets /opt/hap/app/skills /opt/hap/app/platforms; do
  echo "--- $d"
  ls -la "$d" 2>/dev/null | head -8
done

echo
echo "===== 4. 鉴权关键字在源码里的位置 ====="
grep -nE "def (require_|check_|verify_|auth)|session|token|password|admin|401|403|PASSWORD|SECRET|api_key" /opt/hap/app/cloud_v4.py 2>/dev/null | head -50
