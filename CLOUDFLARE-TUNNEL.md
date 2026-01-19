# Cloudflare Tunnel - Sichere Domain-Weiterleitung ohne Port-Forwarding

## 🎯 Was ist Cloudflare Tunnel?

Cloudflare Tunnel (ehemals Argo Tunnel) erstellt eine sichere Verbindung zwischen Ihrem Server und Cloudflare's Edge-Netzwerk **ohne** dass Sie Ports im Router öffnen müssen.

**Vorteile:**
- ✅ Kein Port-Forwarding erforderlich
- ✅ Automatisches SSL/HTTPS von Cloudflare
- ✅ DDoS-Schutz inklusive
- ✅ Ihre Server-IP bleibt verborgen
- ✅ Web Application Firewall (WAF) verfügbar
- ✅ Kostenlos für bis zu 50 Benutzer

## 📋 Setup-Schritte

### 1. Domain zu Cloudflare hinzufügen

1. Gehen Sie zu https://dash.cloudflare.com
2. Klicken Sie auf **"Add a Site"**
3. Geben Sie ein: `likewise.governmententerprise.org`
4. Wählen Sie den **Free Plan**
5. Cloudflare zeigt Ihnen Nameserver an (z.B. `chad.ns.cloudflare.com`)
6. Ändern Sie die Nameserver bei Ihrem Domain-Provider
7. Warten Sie auf DNS-Propagierung (5-30 Minuten)

### 2. Cloudflare Tunnel erstellen

1. Gehen Sie zu https://one.dash.cloudflare.com
2. Navigieren Sie zu **Zero Trust** → **Networks** → **Tunnels**
3. Klicken Sie auf **"Create a tunnel"**
4. Wählen Sie **"Cloudflared"**
5. Geben Sie einen Namen ein: `cascade-media-player`
6. Klicken Sie **"Save tunnel"**
7. **Kopieren Sie das Token** (beginnt mit `eyJ...`)

### 3. Tunnel auf Ihrem Server starten

**Automatisches Setup:**
```bash
cd /var/home/RegSysIPARoyalKaiserCharterRKMaj/Projekte\ -\ VS-Code/Login\ 4\ Websites/cascade-media-player
chmod +x cloudflare-tunnel-setup.sh
./cloudflare-tunnel-setup.sh
```

**Manuelles Setup:**
```bash
# Token ersetzen mit Ihrem echten Token
export CF_TOKEN="IhrCloudflareToken"

podman run -d \
  --name cloudflared \
  --restart=unless-stopped \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token "$CF_TOKEN"
```

### 4. Domain im Cloudflare Dashboard verbinden

1. Im Tunnel-Dashboard: **"Public Hostname"** → **"Add a public hostname"**
2. Konfiguration:
   - **Subdomain:** (leer lassen)
   - **Domain:** `likewise.governmententerprise.org`
   - **Path:** (leer lassen)
   - **Service Type:** `HTTP`
   - **URL:** `host.docker.internal:8080`
     
     *ODER falls das nicht funktioniert:* `192.168.0.90:8080`

3. **"Save hostname"**

### 5. Testen

Nach 1-2 Minuten:
```bash
curl -I https://likewise.governmententerprise.org
```

## 🔧 Container-Verwaltung

### Status prüfen
```bash
podman ps | grep cloudflared
```

### Logs anzeigen
```bash
podman logs -f cloudflared
```

### Neu starten
```bash
podman restart cloudflared
```

### Stoppen
```bash
podman stop cloudflared
```

### Entfernen
```bash
podman rm -f cloudflared
```

## 🔐 Zusätzliche Sicherheit (Optional)

### Cloudflare Access aktivieren

1. In Cloudflare Zero Trust: **Access** → **Applications** → **Add an application**
2. Wählen Sie **Self-hosted**
3. Konfigurieren Sie:
   - **Application name:** Cascade Media Player
   - **Application domain:** `likewise.governmententerprise.org`
4. Erstellen Sie eine Access Policy:
   - Beispiel: Nur bestimmte E-Mail-Adressen erlauben
   - Oder: IP-basierte Zugriffskontrolle

### WAF (Web Application Firewall)

1. Im Cloudflare Dashboard: **Security** → **WAF**
2. Aktivieren Sie vordefinierte Regeln
3. Erstellen Sie Custom Rules bei Bedarf

## 📊 Architektur

```
Benutzer (Internet)
    ↓
    ↓ HTTPS (SSL von Cloudflare)
    ↓
Cloudflare Edge Network
    ↓
    ↓ verschlüsselter Tunnel
    ↓ (kein offener Port!)
    ↓
Cloudflared Container (localhost)
    ↓
    ↓ HTTP (intern)
    ↓
Cascade Media Player App (Port 8080)
```

## ⚙️ Aktuelle Container-Übersicht

Nach Setup sollten folgende Container laufen:

```bash
podman ps
```

Erwartete Container:
1. **cascade-media-player-app** - Ihre React-App (Port 8080)
2. **cloudflared** - Cloudflare Tunnel (keine exponierten Ports)

**Caddy wird nicht mehr benötigt** wenn Sie Cloudflare Tunnel nutzen! Sie können ihn stoppen:
```bash
podman stop caddy-proxy
podman rm caddy-proxy
```

## 🆘 Troubleshooting

### Tunnel verbindet nicht

**Logs prüfen:**
```bash
podman logs cloudflared
```

**Häufige Fehler:**
- Token falsch → Token neu kopieren
- `host.docker.internal` nicht erreichbar → `192.168.0.90:8080` verwenden
- Container kann App nicht erreichen → Prüfen Sie mit `curl localhost:8080`

### Domain zeigt Fehler

1. **DNS noch nicht propagiert:**
   ```bash
   nslookup likewise.governmententerprise.org
   ```
   Sollte Cloudflare IPs zeigen (104.x.x.x oder 172.x.x.x)

2. **Hostname nicht konfiguriert:**
   - Prüfen Sie im Cloudflare Dashboard ob "Public Hostname" eingerichtet ist

3. **App läuft nicht:**
   ```bash
   podman ps | grep cascade
   curl localhost:8080
   ```

## 🎉 Fertig!

Nach dem Setup ist Ihre Website erreichbar unter:
- **https://likewise.governmententerprise.org**

**Keine** Ports müssen geöffnet werden!  
**Keine** Router-Konfiguration nötig!  
**Automatisches** SSL-Zertifikat!  

---

**Weitere Informationen:**
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Zero Trust Dashboard](https://one.dash.cloudflare.com)
