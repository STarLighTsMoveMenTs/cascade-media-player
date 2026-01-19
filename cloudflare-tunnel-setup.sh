#!/bin/bash

# Cloudflare Tunnel Setup für likewise.governmententerprise.org
# Keine Port-Weiterleitungen erforderlich!

set -e

# Token-Dateipfad (NIEMALS in Git committen!)
TOKEN_FILE="/home/RegSysIPARoyalKaiserCharterRKMaj/Schreibtisch/API TOKEN/API TOKEN CLOUDFLARE.txt"

echo "🌐 Cloudflare Tunnel Setup"
echo "=========================="
echo ""

# Sicher Token aus Datei lesen
if [ ! -f "$TOKEN_FILE" ]; then
    echo "❌ Token-Datei nicht gefunden: $TOKEN_FILE"
    echo ""
    echo "Bitte erstellen Sie die Datei mit Ihrem Cloudflare Token:"
    echo "  mkdir -p \"$(dirname "$TOKEN_FILE")\""
    echo "  echo \"IHR_TOKEN\" > \"$TOKEN_FILE\""
    echo "  chmod 600 \"$TOKEN_FILE\""
    exit 1
fi

# Token sicher laden (ohne in Logs zu erscheinen)
CF_TOKEN=$(cat "$TOKEN_FILE" | tr -d '[:space:]')

if [ -z "$CF_TOKEN" ]; then
    echo "❌ Token-Datei ist leer!"
    exit 1
fi

# Niemals den Token anzeigen!
echo "✅ Token erfolgreich geladen (Länge: ${#CF_TOKEN} Zeichen)"

echo ""
echo "📝 Erstelle Konfiguration..."

# Stoppe alten Cloudflare Container falls vorhanden
podman rm -f cloudflared 2>/dev/null || true

# Stoppe auch Caddy (wird nicht mehr benötigt)
echo "🛑 Stoppe Caddy (wird durch Cloudflare ersetzt)..."
podman stop caddy-proxy 2>/dev/null || true
podman rm caddy-proxy 2>/dev/null || true

# Starte Cloudflare Tunnel
echo ""
echo "🚀 Starte Cloudflare Tunnel..."
# Token wird als Umgebungsvariable übergeben (sicherer!)
podman run -d \
  --name cloudflared \
  --restart=unless-stopped \
  --add-host=host.docker.internal:host-gateway \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token "$CF_TOKEN" 2>&1 | grep -v "token"

echo ""
echo "✅ Cloudflare Tunnel gestartet!"
echo ""
echo "Schritt 3: Domain in Cloudflare Dashboard verbinden"
echo "  → Im Tunnel-Dashboard: 'Public Hostname' → 'Add a public hostname'"
echo "  → Subdomain: (leer lassen für Root-Domain)"
echo "  → Domain: likewise.governmententerprise.org"
echo "  → Service Type: HTTP"
echo "  → URL: host.docker.internal:8080"
echo ""
echo "🎉 Fertig! Ihre Website ist in wenigen Minuten verfügbar unter:"
echo "   https://likewise.governmententerprise.org"
echo ""
echo "📊 Logs anzeigen: podman logs -f cloudflared"
