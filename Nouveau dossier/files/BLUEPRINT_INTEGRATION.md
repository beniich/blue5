# 🎨 Guide d'Intégration Blueprint UI
## School 1cc & CRM Pro.cc

---

## 📋 Table des Matières

1. [Introduction à Blueprint](#introduction-à-blueprint)
2. [Pourquoi Blueprint UI](#pourquoi-blueprint-ui)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Composants Blueprint pour School 1cc](#composants-blueprint-pour-school-1cc)
6. [Composants Blueprint pour CRM Pro.cc](#composants-blueprint-pour-crm-pro-cc)
7. [Migration des composants existants](#migration-des-composants-existants)
8. [Thèmes personnalisés](#thèmes-personnalisés)
9. [Exemples de pages](#exemples-de-pages)
10. [Best Practices](#best-practices)

---

## 📖 Introduction à Blueprint

Blueprint est une bibliothèque de composants UI React développée par Palantir, conçue pour créer des interfaces complexes et riches en données. C'est parfait pour :

- 📊 Applications de tableau de bord
- 📈 Outils d'analyse de données
- 🏥 Systèmes de gestion complexes
- 📚 Plateformes éducatives

### Caractéristiques principales

✅ **Composants professionnels** - Tables, formulaires, dialogues, menus
✅ **Accessibilité** - Support ARIA complet
✅ **Thèmes** - Dark mode inclus
✅ **TypeScript** - Support complet
✅ **Performant** - Optimisé pour les grandes listes
✅ **Documentation** - Excellente documentation et exemples

---

## 💡 Pourquoi Blueprint UI

### Avantages pour School 1cc

| Besoin | Solution Blueprint |
|--------|-------------------|
| Tables de données élèves | `Table2` avec tri, filtres, pagination |
| Formulaires complexes | `FormGroup`, `InputGroup`, validation |
| Calendrier emploi du temps | `DatePicker`, `TimePicker` |
| Notifications | `Toast`, `Alert` |
| Navigation | `Menu`, `Navbar`, `Tabs` |

### Avantages pour CRM Pro.cc

| Besoin | Solution Blueprint |
|--------|-------------------|
| Dossiers patients | `Card`, `Collapse`, `Tag` |
| Planning médical | `DateRangePicker`, `Timeline` |
| Statistiques | `ProgressBar`, `Spinner` |
| Gestion du personnel | `Tree`, `MultiSelect` |
| Facturation | `NumericInput`, `EditableText` |

---

## 📦 Installation

### School 1cc

```bash
cd school-1cc

# Installation de Blueprint
npm install @blueprintjs/core @blueprintjs/datetime @blueprintjs/select @blueprintjs/table @blueprintjs/icons

# Types TypeScript (déjà inclus)
# @blueprintjs/* packages incluent leurs propres types

# Dépendances peer
npm install react-transition-group
npm install date-fns # Pour DatePicker
```

### CRM Pro.cc

```bash
cd crm-pro

# Installation de Blueprint
npm install @blueprintjs/core @blueprintjs/datetime @blueprintjs/select @blueprintjs/table @blueprintjs/icons

# Composants additionnels
npm install @blueprintjs/timezone # Pour gestion des fuseaux horaires

# Dépendances peer
npm install react-transition-group
npm install date-fns
```

### Versions recommandées

```json
{
  "dependencies": {
    "@blueprintjs/core": "^5.10.0",
    "@blueprintjs/datetime": "^5.3.0",
    "@blueprintjs/select": "^5.2.0",
    "@blueprintjs/table": "^5.2.0",
    "@blueprintjs/icons": "^5.8.0",
    "react-transition-group": "^4.4.5",
    "date-fns": "^3.0.0"
  }
}
```

---

## ⚙️ Configuration

### 1. Import des styles Blueprint

#### School 1cc - src/main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Styles Blueprint - DOIT être importé avant les styles custom
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import '@blueprintjs/table/lib/css/table.css';

// Vos styles custom
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. Configuration Tailwind compatible

```typescript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Important: ne pas purger les classes Blueprint
  safelist: [
    {
      pattern: /^bp5-/,
    }
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs Blueprint
        'bp-blue': '#137CBD',
        'bp-green': '#0F9960',
        'bp-orange': '#D9822B',
        'bp-red': '#DB3737',
        'bp-gray': '#5C7080',
      }
    },
  },
  plugins: [],
  // Désactiver les conflits avec Blueprint
  corePlugins: {
    preflight: false,
  }
}
```

### 3. Thème Provider

```typescript
// src/providers/BlueprintThemeProvider.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Classes } from '@blueprintjs/core';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useBlueprintTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useBlueprintTheme must be used within BlueprintThemeProvider');
  }
  return context;
};

export const BlueprintThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Charger le thème depuis localStorage
    const savedTheme = localStorage.getItem('blueprint-theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Appliquer le thème au body
    if (theme === 'dark') {
      document.body.classList.add(Classes.DARK);
    } else {
      document.body.classList.remove(Classes.DARK);
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('blueprint-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 4. Mise à jour de App.tsx

```typescript
// src/App.tsx

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { BlueprintThemeProvider } from './providers/BlueprintThemeProvider';
import Routes from './routes';

function App() {
  return (
    <BlueprintThemeProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </BlueprintThemeProvider>
  );
}

export default App;
```

---

## 🎓 Composants Blueprint pour School 1cc

### 1. Table des Élèves

```typescript
// src/components/school/StudentsTable.tsx

import React, { useState } from 'react';
import {
  Button,
  Intent,
  Tag,
  Icon,
  Menu,
  MenuItem,
  Popover,
  Position,
  InputGroup,
} from '@blueprintjs/core';
import { Cell, Column, Table2, TableLoadingOption } from '@blueprintjs/table';
import { IconNames } from '@blueprintjs/icons';

interface Student {
  id: string;
  name: string;
  class: string;
  grade: number;
  attendance: number;
  status: 'active' | 'inactive' | 'suspended';
}

const SAMPLE_STUDENTS: Student[] = [
  { id: '1', name: 'Alice Dupont', class: '5A', grade: 85, attendance: 95, status: 'active' },
  { id: '2', name: 'Bob Martin', class: '5B', grade: 72, attendance: 88, status: 'active' },
  { id: '3', name: 'Claire Lefebvre', class: '5A', grade: 91, attendance: 97, status: 'active' },
];

export const StudentsTable: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(SAMPLE_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtrage
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render cells
  const renderNameCell = (rowIndex: number) => (
    <Cell>
      <div className="flex items-center gap-2">
        <Icon icon={IconNames.PERSON} />
        <span className="font-medium">{filteredStudents[rowIndex].name}</span>
      </div>
    </Cell>
  );

  const renderClassCell = (rowIndex: number) => (
    <Cell>
      <Tag minimal intent={Intent.PRIMARY}>
        {filteredStudents[rowIndex].class}
      </Tag>
    </Cell>
  );

  const renderGradeCell = (rowIndex: number) => {
    const grade = filteredStudents[rowIndex].grade;
    const intent = grade >= 80 ? Intent.SUCCESS : grade >= 60 ? Intent.WARNING : Intent.DANGER;
    
    return (
      <Cell>
        <Tag intent={intent}>{grade}%</Tag>
      </Cell>
    );
  };

  const renderAttendanceCell = (rowIndex: number) => {
    const attendance = filteredStudents[rowIndex].attendance;
    const intent = attendance >= 90 ? Intent.SUCCESS : attendance >= 75 ? Intent.WARNING : Intent.DANGER;
    
    return (
      <Cell>
        <Tag intent={intent}>{attendance}%</Tag>
      </Cell>
    );
  };

  const renderStatusCell = (rowIndex: number) => {
    const status = filteredStudents[rowIndex].status;
    const intent = status === 'active' ? Intent.SUCCESS : status === 'inactive' ? Intent.WARNING : Intent.DANGER;
    
    return (
      <Cell>
        <Tag intent={intent}>
          {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Suspendu'}
        </Tag>
      </Cell>
    );
  };

  const renderActionsCell = (rowIndex: number) => {
    const student = filteredStudents[rowIndex];
    
    const menu = (
      <Menu>
        <MenuItem icon={IconNames.EYE_OPEN} text="Voir le profil" />
        <MenuItem icon={IconNames.EDIT} text="Modifier" />
        <MenuItem icon={IconNames.ENVELOPE} text="Contacter" />
        <Menu.Divider />
        <MenuItem icon={IconNames.TRASH} text="Supprimer" intent={Intent.DANGER} />
      </Menu>
    );
    
    return (
      <Cell>
        <Popover content={menu} position={Position.BOTTOM_RIGHT}>
          <Button icon={IconNames.MORE} minimal />
        </Popover>
      </Cell>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et actions */}
      <div className="flex items-center gap-4">
        <InputGroup
          leftIcon={IconNames.SEARCH}
          placeholder="Rechercher un élève..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        
        <Button
          icon={IconNames.PLUS}
          intent={Intent.PRIMARY}
          text="Ajouter un élève"
        />
        
        <Button
          icon={IconNames.DOWNLOAD}
          text="Exporter"
        />
      </div>

      {/* Table */}
      <Table2
        numRows={filteredStudents.length}
        enableRowHeader={false}
        loadingOptions={loading ? [TableLoadingOption.CELLS] : []}
        className="rounded-lg overflow-hidden shadow-lg"
      >
        <Column name="Nom" cellRenderer={renderNameCell} />
        <Column name="Classe" cellRenderer={renderClassCell} />
        <Column name="Moyenne" cellRenderer={renderGradeCell} />
        <Column name="Assiduité" cellRenderer={renderAttendanceCell} />
        <Column name="Statut" cellRenderer={renderStatusCell} />
        <Column name="Actions" cellRenderer={renderActionsCell} />
      </Table2>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Affichage de {filteredStudents.length} élève(s)
        </span>
        
        <div className="flex gap-2">
          <Button icon={IconNames.CHEVRON_LEFT} disabled />
          <Button text="1" intent={Intent.PRIMARY} />
          <Button text="2" />
          <Button text="3" />
          <Button icon={IconNames.CHEVRON_RIGHT} />
        </div>
      </div>
    </div>
  );
};

export default StudentsTable;
```

### 2. Formulaire d'Ajout d'Élève

```typescript
// src/components/school/AddStudentDialog.tsx

import React, { useState } from 'react';
import {
  Dialog,
  Classes,
  Button,
  Intent,
  FormGroup,
  InputGroup,
  HTMLSelect,
  TextArea,
  FileInput,
  Divider,
  Tag,
} from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import { IconNames } from '@blueprintjs/icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: any) => void;
}

export const AddStudentDialog: React.FC<AddStudentDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(),
    gender: 'male',
    class: '',
    section: '',
    email: '',
    phone: '',
    address: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    medicalInfo: '',
    photo: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName) newErrors.lastName = 'Nom requis';
    if (!formData.class) newErrors.class = 'Classe requise';
    if (!formData.email) newErrors.email = 'Email requis';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  };

  const parseDate = (str: string) => {
    return new Date(str);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter un nouvel élève"
      icon={IconNames.PERSON}
      className="w-full max-w-3xl"
    >
      <div className={Classes.DIALOG_BODY}>
        <div className="space-y-4">
          {/* Photo */}
          <FormGroup label="Photo de profil" labelInfo="(optionnel)">
            <FileInput
              text={formData.photo?.name || "Choisir un fichier..."}
              onInputChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) {
                  setFormData({ ...formData, photo: file });
                }
              }}
              inputProps={{ accept: 'image/*' }}
            />
          </FormGroup>

          <Divider />

          {/* Informations personnelles */}
          <div className="grid grid-cols-2 gap-4">
            <FormGroup
              label="Prénom"
              labelInfo="(requis)"
              intent={errors.firstName ? Intent.DANGER : Intent.NONE}
              helperText={errors.firstName}
            >
              <InputGroup
                intent={errors.firstName ? Intent.DANGER : Intent.NONE}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Prénom de l'élève"
              />
            </FormGroup>

            <FormGroup
              label="Nom"
              labelInfo="(requis)"
              intent={errors.lastName ? Intent.DANGER : Intent.NONE}
              helperText={errors.lastName}
            >
              <InputGroup
                intent={errors.lastName ? Intent.DANGER : Intent.NONE}
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Nom de l'élève"
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Date de naissance">
              <DateInput
                formatDate={formatDate}
                parseDate={parseDate}
                placeholder="JJ/MM/AAAA"
                value={formData.dateOfBirth}
                onChange={(date) => date && setFormData({ ...formData, dateOfBirth: date })}
                locale="fr"
              />
            </FormGroup>

            <FormGroup label="Genre">
              <HTMLSelect
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[
                  { label: 'Masculin', value: 'male' },
                  { label: 'Féminin', value: 'female' },
                  { label: 'Autre', value: 'other' },
                ]}
                fill
              />
            </FormGroup>
          </div>

          <Divider />

          {/* Informations scolaires */}
          <div className="grid grid-cols-2 gap-4">
            <FormGroup
              label="Classe"
              labelInfo="(requis)"
              intent={errors.class ? Intent.DANGER : Intent.NONE}
              helperText={errors.class}
            >
              <HTMLSelect
                intent={errors.class ? Intent.DANGER : Intent.NONE}
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                options={[
                  { label: 'Sélectionner une classe', value: '' },
                  { label: '6ème A', value: '6A' },
                  { label: '6ème B', value: '6B' },
                  { label: '5ème A', value: '5A' },
                  { label: '5ème B', value: '5B' },
                  { label: '4ème A', value: '4A' },
                  { label: '4ème B', value: '4B' },
                ]}
                fill
              />
            </FormGroup>

            <FormGroup label="Section">
              <HTMLSelect
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                options={[
                  { label: 'Sélectionner une section', value: '' },
                  { label: 'Sciences', value: 'sciences' },
                  { label: 'Littéraire', value: 'literature' },
                  { label: 'Technologique', value: 'tech' },
                ]}
                fill
              />
            </FormGroup>
          </div>

          <Divider />

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <FormGroup
              label="Email"
              labelInfo="(requis)"
              intent={errors.email ? Intent.DANGER : Intent.NONE}
              helperText={errors.email}
            >
              <InputGroup
                intent={errors.email ? Intent.DANGER : Intent.NONE}
                leftIcon={IconNames.ENVELOPE}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </FormGroup>

            <FormGroup label="Téléphone">
              <InputGroup
                leftIcon={IconNames.PHONE}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+212 6XX XXX XXX"
              />
            </FormGroup>
          </div>

          <FormGroup label="Adresse">
            <TextArea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Adresse complète"
              fill
              rows={2}
            />
          </FormGroup>

          <Divider />

          {/* Informations parents */}
          <div className="space-y-4">
            <Tag intent={Intent.PRIMARY} large>
              Informations du parent/tuteur
            </Tag>

            <FormGroup label="Nom complet du parent">
              <InputGroup
                leftIcon={IconNames.PERSON}
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Nom du parent ou tuteur"
              />
            </FormGroup>

            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Email du parent">
                <InputGroup
                  leftIcon={IconNames.ENVELOPE}
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  placeholder="email@example.com"
                />
              </FormGroup>

              <FormGroup label="Téléphone du parent">
                <InputGroup
                  leftIcon={IconNames.PHONE}
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+212 6XX XXX XXX"
                />
              </FormGroup>
            </div>
          </div>

          <Divider />

          {/* Informations médicales */}
          <FormGroup label="Informations médicales" labelInfo="(optionnel)">
            <TextArea
              value={formData.medicalInfo}
              onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })}
              placeholder="Allergies, conditions médicales, médicaments..."
              fill
              rows={3}
            />
          </FormGroup>
        </div>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Annuler</Button>
          <Button intent={Intent.PRIMARY} onClick={handleSubmit} icon={IconNames.TICK}>
            Ajouter l'élève
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddStudentDialog;
```

### 3. Calendrier Emploi du Temps

```typescript
// src/components/school/ScheduleCalendar.tsx

import React, { useState } from 'react';
import {
  Card,
  Button,
  Intent,
  Tag,
  Popover,
  Menu,
  MenuItem,
  Position,
} from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import { IconNames } from '@blueprintjs/icons';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ScheduleEvent {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  time: string;
  duration: number;
  color: string;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const SAMPLE_SCHEDULE: Record<string, ScheduleEvent[]> = {
  'Lundi': [
    { id: '1', subject: 'Mathématiques', teacher: 'M. Dubois', room: 'Salle 101', time: '08:00', duration: 2, color: 'blue' },
    { id: '2', subject: 'Français', teacher: 'Mme Martin', room: 'Salle 203', time: '10:00', duration: 1, color: 'green' },
  ],
  'Mardi': [
    { id: '3', subject: 'Physique', teacher: 'M. Laurent', room: 'Labo 1', time: '09:00', duration: 2, color: 'purple' },
  ],
};

export const ScheduleCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('5A');

  const weekStart = startOfWeek(selectedDate, { locale: fr, weekStartsOn: 1 });

  return (
    <div className="space-y-4">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Emploi du temps - Classe {selectedClass}</h2>
          
          <Popover
            content={
              <Menu>
                <MenuItem text="5A" onClick={() => setSelectedClass('5A')} />
                <MenuItem text="5B" onClick={() => setSelectedClass('5B')} />
                <MenuItem text="4A" onClick={() => setSelectedClass('4A')} />
              </Menu>
            }
            position={Position.BOTTOM_LEFT}
          >
            <Button rightIcon={IconNames.CARET_DOWN} text={selectedClass} />
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Popover
            content={
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                locale="fr"
              />
            }
          >
            <Button icon={IconNames.CALENDAR} text={format(selectedDate, 'dd MMMM yyyy', { locale: fr })} />
          </Popover>
          
          <Button intent={Intent.PRIMARY} icon={IconNames.PLUS} text="Ajouter un cours" />
        </div>
      </div>

      {/* Grille emploi du temps */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-24 p-3 text-left text-sm font-semibold text-gray-700 border-r">
                    Heure
                  </th>
                  {DAYS.map((day, index) => (
                    <th
                      key={day}
                      className="p-3 text-center text-sm font-semibold text-gray-700 border-r last:border-r-0"
                    >
                      <div>{day}</div>
                      <div className="text-xs text-gray-500 font-normal">
                        {format(addDays(weekStart, index), 'dd/MM')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time, timeIndex) => (
                  <tr key={time} className="border-t">
                    <td className="p-3 text-sm font-medium text-gray-600 border-r bg-gray-50">
                      {time}
                    </td>
                    {DAYS.map((day) => {
                      const events = SAMPLE_SCHEDULE[day]?.filter(e => e.time === time) || [];
                      
                      return (
                        <td key={`${day}-${time}`} className="p-2 border-r last:border-r-0 align-top">
                          {events.map((event) => (
                            <Popover
                              key={event.id}
                              content={
                                <div className="p-4 max-w-sm">
                                  <h3 className="font-bold text-lg mb-2">{event.subject}</h3>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Enseignant:</strong> {event.teacher}</p>
                                    <p><strong>Salle:</strong> {event.room}</p>
                                    <p><strong>Durée:</strong> {event.duration}h</p>
                                  </div>
                                  <div className="mt-3 flex gap-2">
                                    <Button small icon={IconNames.EDIT} text="Modifier" />
                                    <Button small icon={IconNames.TRASH} intent={Intent.DANGER} text="Supprimer" />
                                  </div>
                                </div>
                              }
                              position={Position.RIGHT}
                            >
                              <div
                                className={`
                                  p-2 rounded cursor-pointer transition-all
                                  hover:shadow-md
                                  ${event.color === 'blue' ? 'bg-blue-100 border-l-4 border-blue-500' : ''}
                                  ${event.color === 'green' ? 'bg-green-100 border-l-4 border-green-500' : ''}
                                  ${event.color === 'purple' ? 'bg-purple-100 border-l-4 border-purple-500' : ''}
                                `}
                                style={{ minHeight: `${event.duration * 60}px` }}
                              >
                                <div className="font-semibold text-sm">{event.subject}</div>
                                <div className="text-xs text-gray-600 mt-1">{event.teacher}</div>
                                <div className="text-xs text-gray-500">{event.room}</div>
                              </div>
                            </Popover>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Légende */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Légende:</span>
        <Tag intent={Intent.PRIMARY}>Mathématiques</Tag>
        <Tag intent={Intent.SUCCESS}>Français</Tag>
        <Tag style={{ backgroundColor: '#8B5CF6', color: 'white' }}>Sciences</Tag>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
```

---

## 🏥 Composants Blueprint pour CRM Pro.cc

### 1. Dossier Patient

```typescript
// src/components/hospital/PatientProfile.tsx

import React, { useState } from 'react';
import {
  Card,
  Elevation,
  Tab,
  Tabs,
  Button,
  Intent,
  Tag,
  Divider,
  Callout,
  Icon,
  EditableText,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  lastVisit: string;
  status: 'stable' | 'critical' | 'recovering';
}

const SAMPLE_PATIENT: Patient = {
  id: 'P001',
  name: 'Jean Dupont',
  age: 45,
  gender: 'Masculin',
  bloodType: 'O+',
  allergies: ['Pénicilline', 'Arachides'],
  conditions: ['Diabète Type 2', 'Hypertension'],
  lastVisit: '15/12/2024',
  status: 'stable',
};

export const PatientProfile: React.FC = () => {
  const [patient, setPatient] = useState(SAMPLE_PATIENT);
  const [selectedTab, setSelectedTab] = useState('overview');

  const getStatusIntent = (status: string) => {
    switch (status) {
      case 'stable': return Intent.SUCCESS;
      case 'critical': return Intent.DANGER;
      case 'recovering': return Intent.WARNING;
      default: return Intent.NONE;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header du patient */}
      <Card elevation={Elevation.TWO} className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <Icon icon={IconNames.PERSON} size={40} className="text-gray-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{patient.name}</h1>
                <Tag intent={getStatusIntent(patient.status)} large>
                  {patient.status === 'stable' ? 'Stable' :
                   patient.status === 'critical' ? 'Critique' : 'En rétablissement'}
                </Tag>
              </div>
              
              <div className="flex gap-4 text-sm text-gray-600">
                <span><Icon icon={IconNames.ID_NUMBER} size={12} /> {patient.id}</span>
                <span><Icon icon={IconNames.CALENDAR} size={12} /> {patient.age} ans</span>
                <span><Icon icon={IconNames.PERSON} size={12} /> {patient.gender}</span>
                <span><Icon icon={IconNames.TINT} size={12} /> {patient.bloodType}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button icon={IconNames.EDIT} text="Modifier" />
            <Button icon={IconNames.PRINT} text="Imprimer" />
            <Button intent={Intent.PRIMARY} icon={IconNames.PLUS} text="Nouvelle consultation" />
          </div>
        </div>

        {/* Alertes */}
        {patient.allergies.length > 0 && (
          <Callout intent={Intent.WARNING} icon={IconNames.WARNING_SIGN} className="mt-4">
            <strong>Allergies:</strong> {patient.allergies.join(', ')}
          </Callout>
        )}
      </Card>

      {/* Tabs avec informations détaillées */}
      <Card elevation={Elevation.TWO}>
        <Tabs
          id="patient-tabs"
          selectedTabId={selectedTab}
          onChange={(tabId) => setSelectedTab(tabId as string)}
        >
          <Tab id="overview" title="Vue d'ensemble" panel={
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Informations générales */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informations générales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date de naissance:</span>
                      <span className="font-medium">15/03/1979</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Téléphone:</span>
                      <span className="font-medium">+212 6XX XXX XXX</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">jean.dupont@email.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adresse:</span>
                      <span className="font-medium">123 Rue Example, Casablanca</span>
                    </div>
                  </div>
                </div>

                {/* Contact d'urgence */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact d'urgence</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom:</span>
                      <span className="font-medium">Marie Dupont</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Relation:</span>
                      <span className="font-medium">Épouse</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Téléphone:</span>
                      <span className="font-medium">+212 6XX XXX XXX</span>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Conditions médicales */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Conditions médicales</h3>
                <div className="flex gap-2">
                  {patient.conditions.map((condition) => (
                    <Tag key={condition} intent={Intent.DANGER} large>
                      {condition}
                    </Tag>
                  ))}
                </div>
              </div>

              <Divider />

              {/* Dernière visite */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Dernière visite</h3>
                <p className="text-sm text-gray-600">
                  {patient.lastVisit} - Consultation de routine avec Dr. Martin
                </p>
              </div>
            </div>
          } />
          
          <Tab id="history" title="Historique médical" panel={
            <div className="p-6">
              <p className="text-gray-600">Historique médical détaillé...</p>
            </div>
          } />
          
          <Tab id="prescriptions" title="Ordonnances" panel={
            <div className="p-6">
              <p className="text-gray-600">Liste des ordonnances...</p>
            </div>
          } />
          
          <Tab id="billing" title="Facturation" panel={
            <div className="p-6">
              <p className="text-gray-600">Informations de facturation...</p>
            </div>
          } />
        </Tabs>
      </Card>
    </div>
  );
};

export default PatientProfile;
```

---

**Suite du guide Blueprint disponible avec:**
- Planning médical interactif
- Gestion des lits d'hôpital
- Système de notifications
- Dark mode complet
- Composants d'accessibilité

Le fichier est prêt ! Voulez-vous que je continue avec les intégrations backend, API, et exemples complets ? 🚀
