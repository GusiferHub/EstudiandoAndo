#!/usr/bin/env bash
set -euo pipefail

sudo apt update
sudo apt install -y docker.io docker-compose-plugin git curl
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

echo "Docker instalado. Cierra sesion y vuelve a entrar para usar docker sin sudo."
