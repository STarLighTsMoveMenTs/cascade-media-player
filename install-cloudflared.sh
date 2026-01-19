#!/bin/bash

# Cloudflared Installation für Fedora/Bazzite
# Native Installation (kein Container)

set -e

echo "🌐 Cloudflared Installation"
echo "==========================="
echo ""

# Systeminfo
echo "📋 System: $(cat /etc/os-release | grep "^PRETTY_NAME" | cut -d'"' -f2)"
echo ""

# Download cloudflared binary
INSTALL_DIR="$HOME/.local/bin"
CLOUDFLARED_BIN="$INSTALL_DIR/cloudflared"

echo "📥 Lade cloudflared herunter..."
mkdir -p "$INSTALL_DIR"

# Download für AMD64
curl -L --progress-bar \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  -o "$CLOUDFLARED_BIN"

# Ausführbar machen
chmod +x "$CLOUDFLARED_BIN"

echo ""
echo "✅ Cloudflared installiert!"
echo ""
echo "📍 Pfad: $CLOUDFLARED_BIN"
echo "🔢 Version: $($CLOUDFLARED_BIN --version)"
echo ""

# Prüfe ob .local/bin im PATH ist
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo "⚠️  $HOME/.local/bin ist nicht im PATH!"
    echo ""
    echo "Fügen Sie diese Zeile zu ~/.bashrc hinzu:"
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
    echo "Oder führen Sie aus:"
    echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc"
    echo "  source ~/.bashrc"
    echo ""
else
    echo "✅ cloudflared ist im PATH verfügbar"
    echo ""
fi

# Token-Setup
TOKEN_FILE="/home/RegSysIPARoyalKaiserCharterRKMaj/Schreibtisch/API TOKEN/API TOKEN CLOUDFLARE.txt"

if [ ! -f "$TOKEN_FILE" ]; then
    echo "⚠️  Token-Datei nicht gefunden: $TOKEN_FILE"
    echo ""
    echo "Bitte Token erstellen:"
    echo "  1. https://one.dash.cloudflare.com"
    echo "  2. Networks → Tunnels → Create a tunnel"
    echo "  3. Token kopieren und in Datei speichern"
    exit 0
fi

CF_TOKEN=$(cat "$TOKEN_FILE" | tr -d '[:space:]')

if [ ${#CF_TOKEN} -lt 100 ]; then
    echo "⚠️  Token scheint zu kurz zu sein (${#CF_TOKEN} Zeichen)"
    echo "    Ein Cloudflare Tunnel Token sollte 200+ Zeichen haben"
    echo "    und mit 'eyJ' beginnen"
    echo ""
    echo "Erstellen Sie ein neues Tunnel Token:"
    echo "  https://one.dash.cloudflare.com → Networks → Tunnels"
    exit 1
fi

echo "✅ Token gefunden (${#CF_TOKEN} Zeichen)"
echo ""

# Systemd Service erstellen
echo "📝 Erstelle systemd Service..."

SERVICE_FILE="$HOME/.config/systemd/user/cloudflared-tunnel.service"
mkdir -p "$HOME/.config/systemd/user"

cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
ExecStart=$CLOUDFLARED_BIN tunnel --no-autoupdate run --token $CF_TOKEN
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
EOF

echo "✅ Service-Datei erstellt: $SERVICE_FILE"
echo ""

# Service aktivieren und starten
systemctl --user daemon-reload
systemctl --user enable cloudflared-tunnel.service
systemctl --user start cloudflared-tunnel.service

echo ""
echo "✅ Service gestartet!"
echo ""
echo "📊 Status prüfen:"
echo "  systemctl --user status cloudflared-tunnel"
echo ""
echo "📜 Logs anzeigen:"
echo "  journalctl --user -u cloudflared-tunnel -f"
echo ""
echo "🔄 Service neu starten:"
echo "  systemctl --user restart cloudflared-tunnel"
echo ""
echo "🛑 Service stoppen:"
echo "  systemctl --user stop cloudflared-tunnel"
echo ""
echo "🎉 Tunnel läuft! Konfigurieren Sie jetzt die Public Hostname in:"
echo "   https://one.dash.cloudflare.com → Ihr Tunnel → Public Hostname"
echo ""
echo "   Domain: likewise.governmententerprise.org"
echo "   Service Type: HTTP"
echo "   URL: localhost:8080"
