#!/bin/bash
echo "===== 内存基线 ====="
free -m
echo
echo "===== swap ====="
swapon --show || echo "no swap"
echo
echo "===== 容器资源 ====="
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.CPUPerc}}"
echo
echo "===== OOM 记录 ====="
dmesg -T 2>/dev/null | grep -i -E 'out of memory|oom-kill' | tail -5 || echo "无 OOM 记录"
echo
echo "===== 磁盘 ====="
df -h / | tail -1
echo
echo "===== sub2api 内存限制 ====="
docker inspect sub2api --format 'Memory={{.HostConfig.Memory}} MemorySwap={{.HostConfig.MemorySwap}} NanoCpus={{.HostConfig.NanoCpus}}'
