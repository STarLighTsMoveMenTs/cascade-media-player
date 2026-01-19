# Cascade Media Player - Podman Deployment Guide

## 🚀 Schnellstart

```bash
# Deployment starten
./deploy-podman.sh
```

## 📋 Voraussetzungen

- ✅ Podman 5.7.1 (installiert)
- ✅ Node.js 20+ für Build
- ✅ Port 8080 verfügbar

## 🔧 Manuelle Befehle

### Image bauen
```bash
podman build -t cascade-media-player:latest .
```

### Container starten
```bash
podman run -d \
  --name cascade-media-player-app \
  -p 8080:80 \
  --restart=unless-stopped \
  cascade-media-player:latest
```

### Container verwalten
```bash
# Status überprüfen
podman ps

# Logs anzeigen
podman logs cascade-media-player-app

# Logs live verfolgen
podman logs -f cascade-media-player-app

# Container stoppen
podman stop cascade-media-player-app

# Container starten
podman start cascade-media-player-app

# Container neu starten
podman restart cascade-media-player-app

# Container entfernen
podman rm cascade-media-player-app

# Image entfernen
podman rmi cascade-media-player:latest
```

## 🌐 Domain-Konfiguration

### Zugriff nach Deployment:
- **Lokal**: http://localhost:8080
- **Domain**: http://Hnoss.PrismanTHarIOn.dev:8080

### Domain-Weiterleitung einrichten:

#### Option 1: Reverse Proxy mit Caddy
```bash
# Caddy installieren
sudo dnf install caddy

# Caddyfile erstellen (/etc/caddy/Caddyfile)
Hnoss.PrismanTHarIOn.dev {
    reverse_proxy localhost:8080
}

# Caddy starten
sudo systemctl start caddy
sudo systemctl enable caddy
```

#### Option 2: Nginx Reverse Proxy
```bash
# Nginx installieren
sudo dnf install nginx

# Config erstellen (/etc/nginx/conf.d/cascade.conf)
server {
    listen 80;
    server_name Hnoss.PrismanTHarIOn.dev;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Nginx neu starten
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### Option 3: /etc/hosts für lokale Tests
```bash
# Hosts-Datei bearbeiten
sudo nano /etc/hosts

# Zeile hinzufügen:
127.0.0.1   Hnoss.PrismanTHarIOn.dev
```

## 🔒 HTTPS einrichten (optional)

```bash
# Mit Caddy (automatisches SSL)
Hnoss.PrismanTHarIOn.dev {
    reverse_proxy localhost:8080
    tls your-email@example.com
}

# Oder mit Certbot + Nginx
sudo dnf install certbot python3-certbot-nginx
sudo certbot --nginx -d Hnoss.PrismanTHarIOn.dev
```

## 📊 Monitoring

```bash
# Container-Statistiken
podman stats cascade-media-player-app

# Ressourcen-Nutzung
podman inspect cascade-media-player-app | jq '.[0].State'

# Health-Check
curl http://localhost:8080
```

## 🐛 Troubleshooting

### Port bereits belegt
```bash
# Port-Nutzung prüfen
sudo ss -tulpn | grep 8080

# Anderen Port verwenden
podman run -d --name cascade-media-player-app -p 8081:80 cascade-media-player:latest
```

### Build-Fehler
```bash
# Node-Module neu installieren
npm install

# Cache löschen
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Container startet nicht
```bash
# Logs überprüfen
podman logs cascade-media-player-app

# Interaktiver Modus
podman run -it --rm cascade-media-player:latest /bin/sh
```

## 📦 Backup & Restore

### Container-Image exportieren
```bash
podman save cascade-media-player:latest -o cascade-media-player.tar
```

### Image importieren
```bash
podman load -i cascade-media-player.tar
```

## 🔄 Update-Prozess

```bash
# 1. Neues Image bauen
podman build -t cascade-media-player:latest .

# 2. Alten Container stoppen
podman stop cascade-media-player-app

# 3. Alten Container entfernen
podman rm cascade-media-player-app

# 4. Neuen Container starten
podman run -d --name cascade-media-player-app -p 8080:80 cascade-media-player:latest

# Oder einfach:
./deploy-podman.sh
```

## 🎯 Produktions-Tipps

1. **Resource Limits setzen**:
```bash
podman run -d \
  --name cascade-media-player-app \
  -p 8080:80 \
  --memory="1g" \
  --cpus="1.0" \
  cascade-media-player:latest
```

2. **Volumes für Logs**:
```bash
podman run -d \
  --name cascade-media-player-app \
  -p 8080:80 \
  -v cascade-logs:/var/log/nginx \
  cascade-media-player:latest
```

3. **Auto-Restart aktivieren**:
```bash
--restart=unless-stopped  # Bereits im Script enthalten
```
