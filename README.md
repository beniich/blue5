# Dash1cc - Applications Multi-Domaines

Architecture complète avec 4 applications interconnectées pour la gestion scolaire et hospitalière.

##  Architecture

`
dash1cc/
 school-1cc/         - Application de gestion scolaire
 crm-pro/            - Application de gestion hospitalière/CRM
 admin-dashboard/    - Dashboard d'administration centralisé
 backend-api/        - Backend API partagé
`

##  Démarrage Rapide

### Option 1: Script Automatique
\\\ash
.\quick-start.ps1
\\\

### Option 2: Manuel

\\\ash
# Backend API
cd backend-api && npm install && npm run dev

# School 1cc
cd school-1cc && npm install && npm run dev

# CRM Pro.cc
cd crm-pro && npm install && npm run dev

# Admin Dashboard
cd admin-dashboard && npm install && npm run dev
\\\

##  Ports

- Backend API: http://localhost:3000
- School 1cc: http://localhost:5173
- CRM Pro.cc: http://localhost:5174
- Admin Dashboard: http://localhost:5175

##  Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Blueprint UI (Palantir) + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma
- **Analytics**: Power BI Embedded
- **Auth**: JWT + Azure AD

##  Documentation

Consultez les READMEs individuels dans chaque dossier d'application.

##  Docker

\\\ash
docker-compose up -d
\\\

##  Licence

MIT  2025
