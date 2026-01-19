#!/bin/bash

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Cascade Media Player - Podman Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Variablen
IMAGE_NAME="cascade-media-player"
CONTAINER_NAME="cascade-media-player-app"
DOMAIN="Hnoss.PrismanTHarIOn.dev"
PORT="8080"

# Schritt 1: Image bauen
echo -e "\n${GREEN}[1/4] Building Docker Image...${NC}"
podman build -t $IMAGE_NAME:latest . || { echo -e "${RED}Build failed!${NC}"; exit 1; }

# Schritt 2: Alten Container stoppen und entfernen
echo -e "\n${GREEN}[2/4] Removing old container...${NC}"
podman stop $CONTAINER_NAME 2>/dev/null
podman rm $CONTAINER_NAME 2>/dev/null

# Schritt 3: Neuen Container starten
echo -e "\n${GREEN}[3/4] Starting new container...${NC}"
podman run -d \
  --name $CONTAINER_NAME \
  -p $PORT:80 \
  --restart=unless-stopped \
  $IMAGE_NAME:latest

# Schritt 4: Status überprüfen
echo -e "\n${GREEN}[4/4] Checking container status...${NC}"
sleep 2
if podman ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✓ Container is running!${NC}"
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Deployment successful!${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "Access your application at:"
    echo -e "  ${GREEN}→ http://localhost:$PORT${NC}"
    echo -e "  ${GREEN}→ http://$DOMAIN:$PORT${NC}"
    echo -e "\nContainer details:"
    podman ps | grep $CONTAINER_NAME
else
    echo -e "${RED}✗ Container failed to start!${NC}"
    echo -e "Check logs with: podman logs $CONTAINER_NAME"
    exit 1
fi
