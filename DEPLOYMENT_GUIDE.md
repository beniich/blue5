# 🚀 Guide de Déploiement Complet
## School 1cc & CRM Pro.cc

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Déploiement Local](#déploiement-local)
3. [Déploiement avec Docker](#déploiement-avec-docker)
4. [Déploiement sur Vercel](#déploiement-sur-vercel)
5. [Déploiement sur Netlify](#déploiement-sur-netlify)
6. [Déploiement sur VPS](#déploiement-sur-vps)
7. [Configuration DNS](#configuration-dns)
8. [SSL/TLS (HTTPS)](#ssltls-https)
9. [Monitoring et Logs](#monitoring-et-logs)
10. [Sauvegarde et Restauration](#sauvegarde-et-restauration)

---

## 📦 Prérequis

### Outils Nécessaires

```bash
# Node.js et npm
node --version  # v18+
npm --version   # v9+

# Git
git --version

# Docker (optionnel)
docker --version
docker-compose --version
```

### Variables d'Environnement

#### School 1cc (.env.production)

```env
VITE_APP_NAME=School 1cc
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://api.school1cc.com
```

#### CRM Pro.cc (.env.production)

```env
VITE_APP_NAME=CRM Pro.cc
VITE_APP_VERSION=1.0.0
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
VITE_API_URL=https://api.crmpro.cc
```

---

## 🏠 Déploiement Local

### School 1cc

```bash
# Navigation vers le projet
cd "D:\git produit\crm\crm-hub-main\dash1cc\school-1cc"

# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Build de production
npm run build

# Test du build localement
npm run preview
```

### CRM Pro.cc

```bash
# Navigation vers le projet
cd "D:\git produit\crm\crm-hub-main\dash1cc\crm-pro"

# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Build de production
npm run build

# Test du build localement
npm run preview
```

---

## 🐳 Déploiement avec Docker

### Configuration Docker

1. **Créer les Dockerfiles** (voir `Dockerfiles.md`)

2. **Créer les fichiers nginx.conf** dans chaque projet

3. **Configuration docker-compose.yml** (voir `docker-compose.yml`)

### Commandes Docker

```bash
# Build des images
docker-compose build

# Démarrage des services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Reconstruire et redémarrer
docker-compose up -d --build
```

### Variables d'environnement Docker

Créer un fichier `.env` à la racine :

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SecurePassword123!
POSTGRES_DB=crm_pro

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxx

# Grafana
GRAFANA_PASSWORD=SecurePassword123!
```

### Accès aux services

- School 1cc: http://localhost:5173
- CRM Pro.cc: http://localhost:5174
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090
- Traefik Dashboard: http://localhost:8080

---

## ☁️ Déploiement sur Vercel

### School 1cc

```bash
# Installation de Vercel CLI
npm i -g vercel

# Login
vercel login

# Déploiement
cd school-1cc
vercel

# Configuration automatique détectée:
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist
```

### Configuration Vercel (vercel.json)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "env": {
    "VITE_APP_NAME": "School 1cc",
    "VITE_APP_VERSION": "1.0.0"
  }
}
```

### CRM Pro.cc sur Vercel

Même processus, mais ajouter les variables d'environnement sensibles via le dashboard Vercel :

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLIC_KEY
```

### Domaines personnalisés

```bash
# Ajouter un domaine
vercel domains add school1cc.com
vercel domains add www.school1cc.com

# Vérifier
vercel domains ls
```

---

## 🌐 Déploiement sur Netlify

### Méthode 1: CLI

```bash
# Installation
npm install -g netlify-cli

# Login
netlify login

# Déploiement
cd school-1cc
netlify deploy --prod
```

### Méthode 2: Git Integration

1. Push votre code sur GitHub/GitLab
2. Connectez Netlify à votre repo
3. Configuration automatique

### Configuration Netlify (netlify.toml)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/*.css"
  [headers.values]
    Content-Type = "text/css; charset=utf-8"
```

---

## 🖥️ Déploiement sur VPS (Ubuntu)

### 1. Préparation du Serveur

```bash
# Connexion SSH
ssh root@your-server-ip

# Mise à jour du système
apt update && apt upgrade -y

# Installation de Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Installation de Nginx
apt install -y nginx

# Installation de Git
apt install -y git

# Installation de PM2
npm install -g pm2

# Création d'un utilisateur dédié
adduser appuser
usermod -aG sudo appuser
su - appuser
```

### 2. Configuration Nginx

```bash
# Créer la configuration pour School 1cc
sudo nano /etc/nginx/sites-available/school1cc

# Contenu:
server {
    listen 80;
    server_name school1cc.com www.school1cc.com;
    
    root /var/www/school1cc/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}

# Activer le site
sudo ln -s /etc/nginx/sites-available/school1cc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Déploiement de l'Application

```bash
# Créer le répertoire
sudo mkdir -p /var/www/school1cc
sudo chown -R appuser:appuser /var/www/school1cc

# Cloner le repo
cd /var/www/school1cc
git clone https://github.com/your-repo/school-1cc.git .

# Installation et build
npm install
npm run build

# Configuration du déploiement automatique
nano deploy.sh
```

Script de déploiement (`deploy.sh`):

```bash
#!/bin/bash

echo "🚀 Déploiement de School 1cc..."

cd /var/www/school1cc

# Pull des dernières modifications
git pull origin main

# Installation des dépendances
npm install

# Build de production
npm run build

# Redémarrage de Nginx
sudo systemctl reload nginx

echo "✅ Déploiement terminé!"
```

```bash
# Rendre le script exécutable
chmod +x deploy.sh
```

---

## 🌍 Configuration DNS

### Records DNS à créer

#### Pour School 1cc

```
Type    Name                Value                   TTL
A       school1cc.com       your-server-ip          3600
A       www                 your-server-ip          3600
CNAME   api                 school1cc.com           3600
```

#### Pour CRM Pro.cc

```
Type    Name                Value                   TTL
A       crmpro.cc           your-server-ip          3600
A       www                 your-server-ip          3600
CNAME   api                 crmpro.cc               3600
```

### Vérification DNS

```bash
# Vérifier les records A
dig school1cc.com +short
dig crmpro.cc +short

# Vérifier les records CNAME
dig www.school1cc.com +short
dig api.school1cc.com +short
```

---

## 🔒 SSL/TLS (HTTPS)

### Avec Let's Encrypt (Certbot)

```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat pour School 1cc
sudo certbot --nginx -d school1cc.com -d www.school1cc.com

# Obtenir un certificat pour CRM Pro.cc
sudo certbot --nginx -d crmpro.cc -d www.crmpro.cc

# Renouvellement automatique (vérifier)
sudo certbot renew --dry-run

# Ajouter au crontab pour renouvellement auto
sudo crontab -e
# Ajouter:
0 0 1 * * certbot renew --quiet
```

### Configuration Nginx avec SSL

```nginx
server {
    listen 443 ssl http2;
    server_name school1cc.com www.school1cc.com;
    
    ssl_certificate /etc/letsencrypt/live/school1cc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/school1cc.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of configuration
}

server {
    listen 80;
    server_name school1cc.com www.school1cc.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Monitoring et Logs

### Avec PM2

```bash
# Monitoring en temps réel
pm2 monit

# Logs
pm2 logs school1cc
pm2 logs crm-pro

# Informations
pm2 info school1cc
```

### Nginx Logs

```bash
# Logs d'accès
tail -f /var/log/nginx/access.log

# Logs d'erreur
tail -f /var/log/nginx/error.log

# Logs spécifiques
tail -f /var/log/nginx/school1cc.access.log
tail -f /var/log/nginx/school1cc.error.log
```

### Avec Grafana + Prometheus

Voir `docker-compose.yml` pour la configuration complète.

Dashboards pré-configurés :
- Métriques système (CPU, RAM, Disk)
- Métriques application (requêtes, temps de réponse)
- Métriques base de données

---

## 💾 Sauvegarde et Restauration

### Base de données PostgreSQL

```bash
# Sauvegarde
docker exec postgres-db pg_dump -U postgres crm_pro > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
docker exec -i postgres-db psql -U postgres crm_pro < backup_20241223_120000.sql
```

### Redis

```bash
# Sauvegarde
docker exec redis-cache redis-cli SAVE
docker cp redis-cache:/data/dump.rdb ./redis_backup_$(date +%Y%m%d_%H%M%S).rdb

# Restauration
docker cp redis_backup_20241223_120000.rdb redis-cache:/data/dump.rdb
docker restart redis-cache
```

### Fichiers de l'application

```bash
# Sauvegarde complète
tar -czf backup_school1cc_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/school1cc

# Restauration
tar -xzf backup_school1cc_20241223_120000.tar.gz -C /var/www/
```

### Script de sauvegarde automatique

```bash
#!/bin/bash
# backup-all.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL
docker exec postgres-db pg_dump -U postgres crm_pro > $BACKUP_DIR/db_$DATE.sql

# Redis
docker exec redis-cache redis-cli SAVE
docker cp redis-cache:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Applications
tar -czf $BACKUP_DIR/school1cc_$DATE.tar.gz /var/www/school1cc
tar -czf $BACKUP_DIR/crm-pro_$DATE.tar.gz /var/www/crm-pro

# Suppression des anciennes sauvegardes (>7 jours)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Sauvegarde terminée: $DATE"
```

Ajouter au crontab:

```bash
# Sauvegarde quotidienne à 2h du matin
0 2 * * * /opt/scripts/backup-all.sh >> /var/log/backup.log 2>&1
```

---

## 🔧 Dépannage

### Problèmes courants

#### 1. Port déjà utilisé

```bash
# Vérifier les ports utilisés
netstat -tuln | grep :5173
lsof -i :5173

# Tuer le processus
kill -9 <PID>
```

#### 2. Erreur de build

```bash
# Nettoyer et reconstruire
rm -rf node_modules dist
npm install
npm run build
```

#### 3. Problème de permissions

```bash
sudo chown -R $USER:$USER /var/www/school1cc
```

#### 4. Nginx ne démarre pas

```bash
# Vérifier la configuration
sudo nginx -t

# Voir les logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Support

Pour toute aide supplémentaire :
- 📧 Support School 1cc: support@school1cc.com
- 📧 Support CRM Pro.cc: support@crmpro.cc
- 📚 Documentation: https://docs.school1cc.com

---

**Dernière mise à jour**: Décembre 2024
