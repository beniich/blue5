# 📊 Guide d'Intégration Power BI
## School 1cc & CRM Pro.cc

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Architecture Power BI](#architecture-power-bi)
4. [Installation des dépendances](#installation-des-dépendances)
5. [Configuration Power BI Embedded](#configuration-power-bi-embedded)
6. [Intégration dans School 1cc](#intégration-dans-school-1cc)
7. [Intégration dans CRM Pro.cc](#intégration-dans-crm-pro-cc)
8. [Création de Dashboards](#création-de-dashboards)
9. [Sécurité et Permissions](#sécurité-et-permissions)
10. [Exemples de Rapports](#exemples-de-rapports)

---

## 🎯 Vue d'ensemble

Power BI sera intégré pour fournir :

### School 1cc
- 📈 Statistiques de performance des élèves
- 📊 Analyse de présence et assiduité
- 💰 Rapports financiers détaillés
- 📚 Analyse des résultats d'examens
- 👥 Tableau de bord des enseignants

### CRM Pro.cc
- 🏥 Statistiques hospitalières en temps réel
- 👨‍⚕️ Performance du personnel médical
- 💊 Gestion des stocks médicaux
- 💰 Analyse financière et facturation
- 📈 Tendances des admissions et consultations

---

## 📦 Prérequis

### Compte Microsoft Power BI

```bash
# Créer un compte Power BI Pro ou Premium
# URL: https://powerbi.microsoft.com/
```

### Azure Active Directory

```bash
# Configuration nécessaire pour Power BI Embedded
# 1. Créer une application Azure AD
# 2. Obtenir les credentials (Client ID, Client Secret, Tenant ID)
```

### Licences requises

- **Power BI Pro** : Pour développement et test
- **Power BI Embedded** : Pour production (capacité A1 minimum)
- **Power BI Premium** : Pour grandes entreprises (optionnel)

---

## 🏗️ Architecture Power BI

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Power BI Embedded Component                     │  │
│  │  - Rapports interactifs                          │  │
│  │  - Dashboards temps réel                         │  │
│  │  - Filtres personnalisés                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Power BI Service                                │  │
│  │  - Génération de tokens d'accès                  │  │
│  │  - Gestion des permissions                       │  │
│  │  - Refresh des datasets                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Power BI Service                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  - Workspace                                      │  │
│  │  - Reports                                        │  │
│  │  - Datasets                                       │  │
│  │  - Dataflows                                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Data Sources                         │
│  - PostgreSQL / Supabase                                │
│  - Dexie.js (IndexedDB export)                          │
│  - REST APIs                                            │
│  - Excel/CSV files                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Installation des dépendances

### School 1cc

```bash
cd school-1cc

# Installation des packages Power BI
npm install powerbi-client powerbi-client-react
npm install @azure/msal-browser @azure/msal-react
npm install axios

# Types TypeScript
npm install --save-dev @types/powerbi-client
```

### CRM Pro.cc

```bash
cd crm-pro

# Installation des packages Power BI
npm install powerbi-client powerbi-client-react
npm install @azure/msal-browser @azure/msal-react
npm install axios

# Types TypeScript
npm install --save-dev @types/powerbi-client
```

---

## ⚙️ Configuration Power BI Embedded

### 1. Variables d'environnement

#### School 1cc (.env.local)

```env
# Power BI Configuration
VITE_POWERBI_CLIENT_ID=your-azure-app-client-id
VITE_POWERBI_CLIENT_SECRET=your-client-secret
VITE_POWERBI_TENANT_ID=your-tenant-id
VITE_POWERBI_WORKSPACE_ID=your-workspace-id

# Reports IDs
VITE_POWERBI_DASHBOARD_REPORT_ID=report-id-1
VITE_POWERBI_STUDENTS_REPORT_ID=report-id-2
VITE_POWERBI_FINANCE_REPORT_ID=report-id-3
VITE_POWERBI_EXAMS_REPORT_ID=report-id-4

# API Endpoint
VITE_POWERBI_API_URL=http://localhost:3001/api/powerbi
```

#### CRM Pro.cc (.env.local)

```env
# Power BI Configuration
VITE_POWERBI_CLIENT_ID=your-azure-app-client-id
VITE_POWERBI_CLIENT_SECRET=your-client-secret
VITE_POWERBI_TENANT_ID=your-tenant-id
VITE_POWERBI_WORKSPACE_ID=your-workspace-id

# Reports IDs
VITE_POWERBI_HOSPITAL_DASHBOARD_ID=report-id-1
VITE_POWERBI_PATIENTS_REPORT_ID=report-id-2
VITE_POWERBI_BILLING_REPORT_ID=report-id-3
VITE_POWERBI_STAFF_REPORT_ID=report-id-4

# API Endpoint
VITE_POWERBI_API_URL=http://localhost:3002/api/powerbi
```

### 2. Configuration Azure AD

```typescript
// src/config/powerbi.config.ts

export const POWERBI_CONFIG = {
  // Azure AD Configuration
  auth: {
    clientId: import.meta.env.VITE_POWERBI_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_POWERBI_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  
  // Power BI API
  api: {
    scopes: ['https://analysis.windows.net/powerbi/api/.default'],
    baseUrl: 'https://api.powerbi.com/v1.0/myorg',
  },
  
  // Workspace
  workspaceId: import.meta.env.VITE_POWERBI_WORKSPACE_ID,
  
  // Reports
  reports: {
    dashboard: import.meta.env.VITE_POWERBI_DASHBOARD_REPORT_ID,
    students: import.meta.env.VITE_POWERBI_STUDENTS_REPORT_ID,
    finance: import.meta.env.VITE_POWERBI_FINANCE_REPORT_ID,
    exams: import.meta.env.VITE_POWERBI_EXAMS_REPORT_ID,
  },
  
  // Settings
  settings: {
    filterPaneEnabled: true,
    navContentPaneEnabled: true,
    layoutType: 'Master' as const,
    permissions: 'All' as const,
  }
} as const;

export default POWERBI_CONFIG;
```

---

## 🎨 Intégration dans School 1cc

### 1. Service Power BI

```typescript
// src/services/powerbi.service.ts

import axios from 'axios';
import { models } from 'powerbi-client';
import { POWERBI_CONFIG } from '../config/powerbi.config';

export interface PowerBIToken {
  token: string;
  expiresAt: number;
}

export interface EmbedConfig {
  type: 'report';
  id: string;
  embedUrl: string;
  accessToken: string;
  tokenType: models.TokenType;
  settings: models.ISettings;
}

class PowerBIService {
  private tokenCache: Map<string, PowerBIToken> = new Map();
  
  /**
   * Obtenir un token d'accès pour un rapport
   */
  async getEmbedToken(reportId: string): Promise<string> {
    const cached = this.tokenCache.get(reportId);
    
    // Vérifier si le token en cache est toujours valide
    if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
      return cached.token;
    }
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_POWERBI_API_URL}/embed-token`,
        { reportId },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      const { token, expiresAt } = response.data;
      
      // Mettre en cache
      this.tokenCache.set(reportId, { token, expiresAt });
      
      return token;
    } catch (error) {
      console.error('Error getting Power BI embed token:', error);
      throw error;
    }
  }
  
  /**
   * Obtenir la configuration d'embedding pour un rapport
   */
  async getEmbedConfig(reportId: string): Promise<EmbedConfig> {
    try {
      const token = await this.getEmbedToken(reportId);
      
      const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${POWERBI_CONFIG.workspaceId}`;
      
      return {
        type: 'report',
        id: reportId,
        embedUrl,
        accessToken: token,
        tokenType: models.TokenType.Embed,
        settings: {
          filterPaneEnabled: POWERBI_CONFIG.settings.filterPaneEnabled,
          navContentPaneEnabled: POWERBI_CONFIG.settings.navContentPaneEnabled,
          layoutType: models.LayoutType.Custom,
          customLayout: {
            displayOption: models.DisplayOption.FitToWidth,
          },
          background: models.BackgroundType.Transparent,
        },
      };
    } catch (error) {
      console.error('Error getting embed config:', error);
      throw error;
    }
  }
  
  /**
   * Rafraîchir un dataset
   */
  async refreshDataset(datasetId: string): Promise<void> {
    try {
      await axios.post(
        `${import.meta.env.VITE_POWERBI_API_URL}/datasets/${datasetId}/refresh`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (error) {
      console.error('Error refreshing dataset:', error);
      throw error;
    }
  }
  
  /**
   * Exporter un rapport en PDF
   */
  async exportToPDF(reportId: string): Promise<Blob> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_POWERBI_API_URL}/reports/${reportId}/export`,
        { format: 'PDF' },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
  
  /**
   * Appliquer des filtres à un rapport
   */
  createFilter(
    table: string,
    column: string,
    values: any[]
  ): models.IBasicFilter {
    return {
      $schema: 'http://powerbi.com/product/schema#basic',
      target: {
        table,
        column,
      },
      operator: 'In',
      values,
      filterType: models.FilterType.Basic,
    };
  }
}

export const powerBIService = new PowerBIService();
export default powerBIService;
```

### 2. Composant Power BI

```typescript
// src/components/powerbi/PowerBIReport.tsx

import React, { useEffect, useRef, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models, Report, Embed } from 'powerbi-client';
import { powerBIService, EmbedConfig } from '../../services/powerbi.service';
import { Loader2, RefreshCw, Download, Maximize2 } from 'lucide-react';

interface PowerBIReportProps {
  reportId: string;
  filters?: models.IFilter[];
  onLoad?: (report: Report) => void;
  onError?: (error: any) => void;
  className?: string;
}

export const PowerBIReport: React.FC<PowerBIReportProps> = ({
  reportId,
  filters = [],
  onLoad,
  onError,
  className = '',
}) => {
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Charger la configuration d'embedding
  useEffect(() => {
    loadEmbedConfig();
  }, [reportId]);

  // Appliquer les filtres
  useEffect(() => {
    if (report && filters.length > 0) {
      applyFilters();
    }
  }, [report, filters]);

  const loadEmbedConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = await powerBIService.getEmbedConfig(reportId);
      setEmbedConfig(config);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du rapport');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    if (!report) return;
    
    try {
      await report.setFilters(filters);
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  };

  const handleReportLoad = (report: Report) => {
    setReport(report);
    onLoad?.(report);
  };

  const handleRefresh = async () => {
    if (report) {
      try {
        await report.refresh();
      } catch (err) {
        console.error('Error refreshing report:', err);
      }
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await powerBIService.exportToPDF(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadEmbedConfig}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!embedConfig) return null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Barre d'outils */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={handleRefresh}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="Actualiser"
        >
          <RefreshCw className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={handleExportPDF}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="Exporter en PDF"
        >
          <Download className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="Plein écran"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Rapport Power BI */}
      <PowerBIEmbed
        embedConfig={embedConfig}
        eventHandlers={
          new Map([
            ['loaded', () => console.log('Report loaded')],
            ['rendered', () => console.log('Report rendered')],
            ['error', (event) => {
              console.error('Report error:', event?.detail);
              setError('Erreur lors du rendu du rapport');
            }],
          ])
        }
        cssClassName="powerbi-report"
        getEmbeddedComponent={(embeddedReport: Embed) => {
          handleReportLoad(embeddedReport as Report);
        }}
      />
    </div>
  );
};

export default PowerBIReport;
```

### 3. Page Analytics avec Power BI

```typescript
// src/pages/school/Analytics.tsx

import React, { useState } from 'react';
import { PowerBIReport } from '../../components/powerbi/PowerBIReport';
import { POWERBI_CONFIG } from '../../config/powerbi.config';
import { BarChart3, Users, GraduationCap, DollarSign } from 'lucide-react';
import { models } from 'powerbi-client';

const Analytics: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('dashboard');
  const [filters, setFilters] = useState<models.IFilter[]>([]);

  const reports = [
    {
      id: 'dashboard',
      name: 'Tableau de bord',
      icon: BarChart3,
      reportId: POWERBI_CONFIG.reports.dashboard,
    },
    {
      id: 'students',
      name: 'Élèves',
      icon: Users,
      reportId: POWERBI_CONFIG.reports.students,
    },
    {
      id: 'exams',
      name: 'Examens',
      icon: GraduationCap,
      reportId: POWERBI_CONFIG.reports.exams,
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: DollarSign,
      reportId: POWERBI_CONFIG.reports.finance,
    },
  ];

  const currentReport = reports.find((r) => r.id === selectedReport);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Rapports</h1>
        <p className="text-gray-600 mt-2">
          Visualisez et analysez les données de votre établissement
        </p>
      </div>

      {/* Sélecteur de rapports */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {reports.map((report) => {
          const Icon = report.icon;
          const isActive = selectedReport === report.id;
          
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium
                transition-all whitespace-nowrap
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {report.name}
            </button>
          );
        })}
      </div>

      {/* Rapport Power BI */}
      {currentReport && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <PowerBIReport
            reportId={currentReport.reportId}
            filters={filters}
            className="h-[calc(100vh-300px)]"
            onLoad={(report) => {
              console.log('Report loaded:', report);
            }}
            onError={(error) => {
              console.error('Report error:', error);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Analytics;
```

---

## 🏥 Intégration dans CRM Pro.cc

La structure est similaire à School 1cc. Créer les mêmes fichiers avec les IDs de rapports CRM.

---

## 📊 Création de Dashboards

### Exemples de Datasets

#### School 1cc - Students Performance

```sql
-- Query pour Power BI
SELECT 
  s.id as student_id,
  s.name as student_name,
  s.class,
  s.grade_level,
  e.subject,
  e.exam_type,
  e.score,
  e.max_score,
  (e.score * 100.0 / e.max_score) as percentage,
  e.exam_date,
  CASE 
    WHEN (e.score * 100.0 / e.max_score) >= 90 THEN 'Excellent'
    WHEN (e.score * 100.0 / e.max_score) >= 75 THEN 'Bien'
    WHEN (e.score * 100.0 / e.max_score) >= 60 THEN 'Passable'
    ELSE 'Insuffisant'
  END as grade_category
FROM students s
LEFT JOIN exams e ON s.id = e.student_id
WHERE e.exam_date >= DATEADD(month, -6, GETDATE())
ORDER BY e.exam_date DESC;
```

#### CRM Pro.cc - Hospital Statistics

```sql
-- Query pour Power BI
SELECT 
  p.id as patient_id,
  p.name as patient_name,
  p.age,
  p.gender,
  a.admission_date,
  a.discharge_date,
  DATEDIFF(day, a.admission_date, COALESCE(a.discharge_date, GETDATE())) as stay_duration,
  a.department,
  d.name as doctor_name,
  d.specialization,
  b.total_amount,
  b.paid_amount,
  b.status as billing_status
FROM patients p
LEFT JOIN admissions a ON p.id = a.patient_id
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN billing b ON a.id = b.admission_id
WHERE a.admission_date >= DATEADD(month, -12, GETDATE());
```

---

## 🔐 Sécurité et Permissions

### Backend API pour générer les tokens

```typescript
// backend/routes/powerbi.routes.ts

import express from 'express';
import { PowerBIService } from '../services/powerbi.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const powerBIService = new PowerBIService();

// Générer un embed token
router.post('/embed-token', authMiddleware, async (req, res) => {
  try {
    const { reportId } = req.body;
    const userId = req.user.id;
    
    // Vérifier les permissions de l'utilisateur
    const hasAccess = await checkUserReportAccess(userId, reportId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const token = await powerBIService.generateEmbedToken(reportId);
    
    res.json({
      token: token.token,
      expiresAt: token.expiration,
    });
  } catch (error) {
    console.error('Error generating embed token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rafraîchir un dataset
router.post('/datasets/:id/refresh', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await powerBIService.refreshDataset(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

## 📈 Exemples de Rapports Prêts à l'emploi

Tous les fichiers Power BI (.pbix) seront fournis dans le dossier suivant :

```
/powerbi-reports/
  ├── school-1cc/
  │   ├── dashboard.pbix
  │   ├── students-performance.pbix
  │   ├── attendance.pbix
  │   └── financial.pbix
  └── crm-pro/
      ├── hospital-dashboard.pbix
      ├── patient-analytics.pbix
      ├── staff-performance.pbix
      └── billing-reports.pbix
```

---

## 🎨 Personnalisation du Thème

```typescript
// src/config/powerbi-theme.ts

export const POWERBI_THEME = {
  name: 'School1cc-Theme',
  dataColors: [
    '#3B82F6', // Bleu principal
    '#8B5CF6', // Violet
    '#10B981', // Vert
    '#F59E0B', // Orange
    '#EF4444', // Rouge
    '#6366F1', // Indigo
  ],
  background: '#FFFFFF',
  foreground: '#1F2937',
  tableAccent: '#3B82F6',
};
```

---

**Prochaine étape : Blueprint UI Integration** ➡️
