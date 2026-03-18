#!/bin/bash
# setup_swap.sh - Script for configuring 2GB Swap on 1GB RAM Oracle VM
# Run as root: sudo bash setup_swap.sh

set -e

# Size of swap in Megabytes (2GB = 2048)
SWAP_SIZE=2048
SWAP_FILE="/swapfile"

if [ -f "$SWAP_FILE" ]; then
    echo "Swap file $SWAP_FILE already exists. Skipping."
    exit 0
fi

echo "Creating a ${SWAP_SIZE}MB swap file..."
sudo fallocate -l ${SWAP_SIZE}M $SWAP_FILE || sudo dd if=/dev/zero of=$SWAP_FILE bs=1M count=$SWAP_SIZE

echo "Securing swap file permissions..."
sudo chmod 600 $SWAP_FILE

echo "Formatting swap file..."
sudo mkswap $SWAP_FILE

echo "Enabling swap file..."
sudo swapon $SWAP_FILE

echo "Adding swap to /etc/fstab to persist on reboots..."
echo "$SWAP_FILE swap swap defaults 0 0" | sudo tee -a /etc/fstab

echo "Tuning swappiness and cache pressure for 1GB RAM VM..."
# Very low swappiness so it only swaps when absolutely necessary
sudo sysctl vm.swappiness=10
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf

# Increase vfs_cache_pressure to drop inode/dentry caches faster
sudo sysctl vm.vfs_cache_pressure=50
echo "vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.conf

echo "Swap configuration completed successfully!"
free -h
