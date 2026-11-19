#!/bin/bash
set -e
echo "===== 1. 开启 swap（4GB，防 OOM）====="
if swapon --show | grep -q swapfile; then
  echo "swap 已存在，跳过"
else
  if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "swap 已启用"
fi
free -m | grep -i swap

echo
echo "===== 2. 降低 swappiness（优先用物理内存）====="
sysctl -w vm.swappiness=10
grep -q '^vm.swappiness' /etc/sysctl.conf && sed -i 's/^vm.swappiness.*/vm.swappiness=10/' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl vm.swappiness

echo
echo "===== 3. 给 sub2api 三件套加内存上限（不重启容器，用 update）====="
docker update --memory 2g --memory-swap 3g sub2api 2>&1 || echo "sub2api update 失败"
docker update --memory 1g --memory-swap 1536m sub2api-postgres 2>&1 || echo "postgres update 失败"
docker update --memory 512m --memory-swap 768m sub2api-redis 2>&1 || echo "redis update 失败"

echo
echo "===== 4. 验证 ====="
for c in sub2api sub2api-postgres sub2api-redis; do
  docker inspect "$c" --format "{{.Name}} Memory={{.HostConfig.Memory}} MemSwap={{.HostConfig.MemorySwap}}"
done
echo
free -m
