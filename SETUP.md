# 🎓 School 1cc & 🏥 CRM Pro.cc

## 📋 Vue d'ensemble

Ce référentiel contient deux applications distinctes et indépendantes :

### 📚 School 1cc - Plateforme de Gestion Scolaire Intelligente
Application complète pour la gestion d'établissements scolaires avec IA intégrée.

### 🏥 CRM Pro.cc - Plateforme de Gestion Hospitalière et CRM
Solution professionnelle pour la gestion d'établissements de santé.

---

## 🏗️ Architecture du Projet

```
D:\git produit\crm\crm-hub-main\dash1cc\
│
├── school-1cc/                    # Application School 1cc
│   ├── src/
│   │   ├── pages/school/          # Pages scolaires uniquement
│   │   ├── components/school/     # Composants scolaires
│   │   ├── contexts/school/       # Contextes React pour school
│   │   ├── lib/school/            # Utilitaires et helpers
│   │   └── hooks/school/          # Hooks React personnalisés
│   ├── public/
│   │   ├── logo.png              # Logo School 1cc (512x512)
│   │   └── favicon.png           # Favicon (32x32)
│   ├── package.json              # school-1cc v1.0.0
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── crm-pro/                       # Application CRM Pro.cc
    ├── src/
    │   ├── pages/                 # Pages hospital/CRM uniquement
    │   ├── components/            # Composants CRM/Hospital
    │   ├── contexts/              # Contextes React pour CRM
    │   ├── lib/                   # Utilitaires et helpers
    │   └── hooks/                 # Hooks React personnalisés
    ├── public/
    │   ├── logo.png              # Logo CRM Pro.cc (512x512)
    │   └── favicon.png           # Favicon (32x32)
    ├── package.json              # crm-pro v1.0.0
    ├── vite.config.ts
    └── tsconfig.json
```

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Git

### Installation

#### School 1cc

```bash
cd "D:\git produit\crm\crm-hub-main\dash1cc\school-1cc"
npm install
npm run dev
```

Accédez à : `http://localhost:5173`

#### CRM Pro.cc

```bash
cd "D:\git produit\crm\crm-hub-main\dash1cc\crm-pro"
npm install
npm run dev
```

Accédez à : `http://localhost:5174`

---

## 📚 School 1cc - Détails

### 🎯 Fonctionnalités

#### Gestion Administrative
- ✅ **Dashboard scolaire** - Vue d'ensemble des statistiques
- ✅ **Gestion des élèves** - Inscription, profils, historique
- ✅ **Gestion des enseignants** - Profils, matières enseignées
- ✅ **Classes et matières** - Organisation pédagogique
- ✅ **Emploi du temps** - Planning des cours

#### Pédagogie
- ✅ **Examens et notes** - Évaluations et bulletins
- ✅ **Présence** - Suivi de l'assiduité
- ✅ **Documents** - Gestion documentaire
- ✅ **Assistant IA** - Aide pédagogique intelligente

#### Communication & Finance
- ✅ **Communication** - Messagerie interne
- ✅ **Finance** - Facturation et paiements

### 🛠️ Stack Technique

```json
{
  "framework": "React 19",
  "language": "TypeScript",
  "build": "Vite",
  "styling": "Tailwind CSS",
  "database": "Dexie.js (IndexedDB)",
  "charts": "Recharts",
  "routing": "React Router DOM",
  "icons": "Lucide React"
}
```

### 📍 Routes Principales

```typescript
/school                    # Redirection depuis /
/school/dashboard         # Tableau de bord
/school/students          # Gestion élèves
/school/teachers          # Gestion enseignants
/school/classes           # Classes et matières
/school/schedule          # Emploi du temps
/school/exams             # Examens et notes
/school/attendance        # Présence
/school/communication     # Communication
/school/finance           # Finance
/school/documents         # Documents
/school/ai-assistant      # Assistant IA
```

### 🎨 Personnalisation

Le branding de School 1cc est défini dans :

```typescript
// src/config/branding.ts
export const BRANDING = {
  name: 'School 1cc',
  logo: '/logo.png',
  favicon: '/favicon.png',
  theme: {
    primary: '#3b82f6',   // Bleu
    secondary: '#8b5cf6', // Violet
  }
};
```

---

## 🏥 CRM Pro.cc - Détails

### 🎯 Fonctionnalités

#### Gestion Hospitalière
- ✅ **Dashboard hospitalier** - Vue d'ensemble
- ✅ **Gestion des patients** - Dossiers médicaux complets
- ✅ **Détails patient** - Historique et suivi
- ✅ **Agenda/Rendez-vous** - Planning médical

#### Personnel & Ressources
- ✅ **Gestion du personnel** - Médecins, infirmiers, staff
- ✅ **Carte des lits** - Occupation et disponibilité
- ✅ **Vue secrétaire** - Interface dédiée

#### Administration
- ✅ **Facturation** - Gestion financière
- ✅ **Analytics** - Rapports et statistiques
- ✅ **Authentification** - Sécurité et accès

### 🛠️ Stack Technique

```json
{
  "framework": "React 19",
  "language": "TypeScript",
  "build": "Vite",
  "styling": "Tailwind CSS",
  "state": "Zustand",
  "backend": "Supabase (ready)",
  "payments": "Stripe (ready)",
  "routing": "React Router DOM",
  "icons": "Lucide React"
}
```

### 📍 Routes Principales

```typescript
/                          # Redirection vers /dashboard
/dashboard                # Tableau de bord principal
/patients                 # Liste des patients
/patients/:id             # Détails patient
/schedule                 # Agenda et rendez-vous
/staff                    # Gestion du personnel
/bed-map                  # Carte des lits
/billing                  # Facturation
/secretary                # Vue secrétaire
/analytics                # Analytics et rapports
/login                    # Authentification
```

### 🎨 Personnalisation

Le branding de CRM Pro.cc est défini dans :

```typescript
// src/config/branding.ts
export const BRANDING = {
  name: 'CRM Pro.cc',
  logo: '/logo.png',
  favicon: '/favicon.png',
  theme: {
    primary: '#10b981',   // Vert
    secondary: '#3b82f6', // Bleu
  }
};
```

---

## 🔧 Scripts NPM Disponibles

### School 1cc

```bash
npm run dev          # Démarrage développement (port 5173)
npm run build        # Build production
npm run preview      # Prévisualisation build
npm run lint         # Vérification ESLint
npm run type-check   # Vérification TypeScript
```

### CRM Pro.cc

```bash
npm run dev          # Démarrage développement (port 5174)
npm run build        # Build production
npm run preview      # Prévisualisation build
npm run lint         # Vérification ESLint
npm run type-check   # Vérification TypeScript
```

---

## 📦 Dépendances Principales

### Communes aux deux applications

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.1.1",
  "typescript": "^5.6.2",
  "vite": "^6.0.3",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.468.0"
}
```

### Spécifiques à School 1cc

```json
{
  "dexie": "^4.0.10",          // Base de données locale
  "dexie-react-hooks": "^1.1.7",
  "recharts": "^2.15.0"        // Graphiques
}
```

### Spécifiques à CRM Pro.cc

```json
{
  "zustand": "^5.0.2",         // Gestion d'état
  "@supabase/supabase-js": "^2.47.10",  // Backend
  "@stripe/stripe-js": "^4.10.0"        // Paiements
}
```

---

## 🎨 Logos et Assets

### School 1cc

- **Logo principal** : `public/logo.png` (512×512px)
- **Favicon** : `public/favicon.png` (32×32px)
- **Couleurs** : Bleu (#3b82f6) et Violet (#8b5cf6)

### CRM Pro.cc

- **Logo principal** : `public/logo.png` (512×512px)
- **Favicon** : `public/favicon.png` (32×32px)
- **Couleurs** : Vert (#10b981) et Bleu (#3b82f6)

---

## 🔐 Sécurité et Authentification

### School 1cc
- Stockage local avec Dexie.js
- Données chiffrées côté client
- Pas d'authentification backend (version autonome)

### CRM Pro.cc
- Authentification via Supabase
- JWT tokens
- Row Level Security (RLS)
- Accès basé sur les rôles

---

## 🌐 Déploiement

### Build Production

#### School 1cc

```bash
cd school-1cc
npm run build
# Les fichiers sont générés dans dist/
```

#### CRM Pro.cc

```bash
cd crm-pro
npm run build
# Les fichiers sont générés dans dist/
```

### Options de déploiement

#### Hébergement Statique
- ✅ **Vercel** - Recommandé
- ✅ **Netlify**
- ✅ **GitHub Pages**
- ✅ **Cloudflare Pages**

#### Configuration Vercel

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 🧪 Tests

### Lancer les tests

```bash
# School 1cc
cd school-1cc
npm run test

# CRM Pro.cc
cd crm-pro
npm run test
```

### Tests E2E (à configurer)

```bash
npm run test:e2e
```

---

## 🐛 Débogage

### Variables d'environnement

#### School 1cc

```env
# .env.local
VITE_APP_NAME=School 1cc
VITE_APP_VERSION=1.0.0
```

#### CRM Pro.cc

```env
# .env.local
VITE_APP_NAME=CRM Pro.cc
VITE_APP_VERSION=1.0.0
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
```

### Logs de développement

```bash
# Activer les logs détaillés
npm run dev -- --debug
```

---

## 📊 Statistiques du Projet

| Métrique | School 1cc | CRM Pro.cc |
|----------|------------|------------|
| Fichiers sources | ~71,502 | ~71,502 |
| Composants | ~30 | ~25 |
| Pages | 12 | 10 |
| Routes | 11 | 9 |
| Taille bundle (gzip) | ~150KB | ~180KB |

---

## 🤝 Contribution

### Workflow de développement

1. **Créer une branche**
```bash
git checkout -b feature/nom-de-la-fonctionnalite
```

2. **Développer et tester**
```bash
npm run dev
npm run lint
npm run type-check
```

3. **Commit**
```bash
git add .
git commit -m "feat: description de la fonctionnalité"
```

4. **Push et Pull Request**
```bash
git push origin feature/nom-de-la-fonctionnalite
```

### Convention de commits

```
feat: Nouvelle fonctionnalité
fix: Correction de bug
docs: Documentation
style: Formatage
refactor: Refactorisation
test: Tests
chore: Maintenance
```

---

## 📝 Changelog

### v1.0.0 (2024)

#### School 1cc
- ✅ Séparation complète du projet dash-pull
- ✅ Implémentation de toutes les pages scolaires
- ✅ Intégration Dexie.js pour stockage local
- ✅ Assistant IA intégré
- ✅ Logo et branding personnalisés

#### CRM Pro.cc
- ✅ Séparation complète du projet dash-pull
- ✅ Implémentation de toutes les pages hospitalières
- ✅ Préparation Supabase et Stripe
- ✅ Système d'authentification
- ✅ Logo et branding personnalisés

---

## 🆘 Support et Documentation

### Ressources

- 📖 **Documentation React** : https://react.dev
- 📖 **Documentation Vite** : https://vitejs.dev
- 📖 **Documentation Tailwind** : https://tailwindcss.com
- 📖 **Documentation Dexie.js** : https://dexie.org
- 📖 **Documentation Supabase** : https://supabase.com/docs

### Contact

Pour toute question ou support :
- 📧 Email : support@school1cc.com
- 📧 Email : support@crmpro.cc

---

## 📜 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

---

## 🙏 Remerciements

Merci à tous les contributeurs et aux technologies open-source utilisées dans ce projet.

---

**Dernière mise à jour** : Décembre 2024
**Version** : 1.0.0
