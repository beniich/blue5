# Admin Dashboard Pro

Dashboard d'administration centralisé pour superviser School 1cc et CRM Pro.cc

##  Démarrage

\\\ash
# Installation des dépendances Blueprint UI et Power BI
npm install @blueprintjs/core @blueprintjs/icons @blueprintjs/datetime
npm install @blueprintjs/table @blueprintjs/select
npm install powerbi-client powerbi-client-react
npm install @azure/msal-browser @azure/msal-react
npm install axios zustand react-router-dom recharts lucide-react date-fns

# Configuration
cp .env.example .env
# Éditer .env avec vos identifiants

# Développement
npm run dev
\\\

##  URL
http://localhost:5175

##  Fonctionnalités
- Vue unifiée des stats School + CRM
- Power BI dashboards intégrés
- Analytics en temps réel
- Interface Blueprint UI professionnelle

##  Connexions
- Backend API: http://localhost:3000
- School 1cc: http://localhost:5173
- CRM Pro.cc: http://localhost:5174
