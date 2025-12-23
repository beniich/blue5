# Backend API - School 1cc & CRM Pro.cc
# Structure complète avec Express, TypeScript, Power BI, et Supabase

## Structure du projet

```
backend-api/
├── src/
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── powerbi.config.ts
│   │   ├── supabase.config.ts
│   │   └── app.config.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── cors.middleware.ts
│   ├── services/
│   │   ├── powerbi.service.ts
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── email.service.ts
│   ├── routes/
│   │   ├── powerbi.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── school/
│   │   │   ├── students.routes.ts
│   │   │   ├── teachers.routes.ts
│   │   │   ├── classes.routes.ts
│   │   │   └── exams.routes.ts
│   │   └── hospital/
│   │       ├── patients.routes.ts
│   │       ├── appointments.routes.ts
│   │       ├── staff.routes.ts
│   │       └── billing.routes.ts
│   ├── controllers/
│   │   ├── powerbi.controller.ts
│   │   ├── auth.controller.ts
│   │   └── school/
│   │       └── students.controller.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Student.ts
│   │   ├── Patient.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── powerbi.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── jwt.utils.ts
│   │   ├── bcrypt.utils.ts
│   │   ├── validator.utils.ts
│   │   └── logger.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
mkdir backend-api
cd backend-api
npm init -y
```

## package.json complet

```json
{
  "name": "school-crm-backend-api",
  "version": "1.0.0",
  "description": "Backend API for School 1cc and CRM Pro.cc with Power BI integration",
  "main": "dist/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    
    "@prisma/client": "^5.8.0",
    "@supabase/supabase-js": "^2.47.10",
    
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.12.0",
    "zod": "^3.22.4",
    
    "@azure/msal-node": "^2.6.0",
    "axios": "^1.6.5",
    
    "nodemailer": "^6.9.8",
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    
    "socket.io": "^4.7.4",
    "redis": "^4.6.12",
    "ioredis": "^5.3.2",
    
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.1",
    
    "stripe": "^14.11.0",
    
    "date-fns": "^3.0.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.5",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/morgan": "^1.9.9",
    "@types/nodemailer": "^6.4.14",
    "@types/multer": "^1.4.11",
    
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.2",
    
    "prisma": "^5.8.0",
    
    "vitest": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",
    "supertest": "^6.3.4",
    "@types/supertest": "^6.0.2",
    
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    
    "prettier": "^3.2.4"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

## Configuration TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@middleware/*": ["src/middleware/*"],
      "@services/*": ["src/services/*"],
      "@routes/*": ["src/routes/*"],
      "@controllers/*": ["src/controllers/*"],
      "@models/*": ["src/models/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## Variables d'environnement

```env
# .env.example

# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/school_crm_db?schema=public"

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Power BI
POWERBI_CLIENT_ID=your-azure-app-client-id
POWERBI_CLIENT_SECRET=your-client-secret
POWERBI_TENANT_ID=your-tenant-id
POWERBI_AUTHORITY=https://login.microsoftonline.com/your-tenant-id

# School 1cc Power BI
SCHOOL_WORKSPACE_ID=your-school-workspace-id
SCHOOL_DASHBOARD_REPORT_ID=report-id
SCHOOL_STUDENTS_REPORT_ID=report-id
SCHOOL_FINANCE_REPORT_ID=report-id
SCHOOL_EXAMS_REPORT_ID=report-id

# CRM Pro.cc Power BI
CRM_WORKSPACE_ID=your-crm-workspace-id
CRM_DASHBOARD_REPORT_ID=report-id
CRM_PATIENTS_REPORT_ID=report-id
CRM_BILLING_REPORT_ID=report-id
CRM_STAFF_REPORT_ID=report-id

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// User Management
// ==========================================

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  firstName     String
  lastName      String
  role          Role     @default(USER)
  organization  String?  // "school" or "hospital"
  isActive      Boolean  @default(true)
  isVerified    Boolean  @default(false)
  lastLogin     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  refreshTokens RefreshToken[]
  student       Student?
  teacher       Teacher?
  patient       Patient?
  doctor        Doctor?
  
  @@index([email])
  @@index([organization])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([userId])
  @@map("refresh_tokens")
}

enum Role {
  USER
  ADMIN
  TEACHER
  STUDENT
  PARENT
  DOCTOR
  NURSE
  SECRETARY
  BILLING
}

// ==========================================
// School 1cc Models
// ==========================================

model Student {
  id            String    @id @default(uuid())
  userId        String?   @unique
  firstName     String
  lastName      String
  dateOfBirth   DateTime
  gender        Gender
  class         String
  section       String?
  email         String    @unique
  phone         String?
  address       String?
  photoUrl      String?
  
  // Parent/Guardian info
  parentName    String?
  parentEmail   String?
  parentPhone   String?
  
  // Medical info
  medicalInfo   String?
  allergies     String[]
  bloodType     String?
  
  status        StudentStatus @default(ACTIVE)
  enrollmentDate DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User?     @relation(fields: [userId], references: [id])
  exams         Exam[]
  attendances   Attendance[]
  payments      Payment[]
  
  @@index([email])
  @@index([class])
  @@index([status])
  @@map("students")
}

model Teacher {
  id            String   @id @default(uuid())
  userId        String?  @unique
  firstName     String
  lastName      String
  email         String   @unique
  phone         String?
  specialization String?
  qualification String?
  subjects      String[]
  photoUrl      String?
  
  status        TeacherStatus @default(ACTIVE)
  joinDate      DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User?    @relation(fields: [userId], references: [id])
  exams         Exam[]
  schedules     Schedule[]
  
  @@index([email])
  @@index([status])
  @@map("teachers")
}

model Class {
  id          String   @id @default(uuid())
  name        String   @unique
  level       String
  section     String?
  capacity    Int
  room        String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  schedules   Schedule[]
  
  @@map("classes")
}

model Schedule {
  id          String   @id @default(uuid())
  classId     String
  teacherId   String
  subject     String
  dayOfWeek   Int      // 0-6 (Sunday-Saturday)
  startTime   String   // HH:MM format
  endTime     String   // HH:MM format
  room        String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  class       Class    @relation(fields: [classId], references: [id])
  teacher     Teacher  @relation(fields: [teacherId], references: [id])
  
  @@index([classId])
  @@index([teacherId])
  @@index([dayOfWeek])
  @@map("schedules")
}

model Exam {
  id          String   @id @default(uuid())
  studentId   String
  teacherId   String
  subject     String
  examType    ExamType
  totalMarks  Float
  obtainedMarks Float
  percentage  Float
  grade       String?
  examDate    DateTime
  remarks     String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  student     Student  @relation(fields: [studentId], references: [id])
  teacher     Teacher  @relation(fields: [teacherId], references: [id])
  
  @@index([studentId])
  @@index([teacherId])
  @@index([subject])
  @@index([examDate])
  @@map("exams")
}

model Attendance {
  id          String   @id @default(uuid())
  studentId   String
  date        DateTime
  status      AttendanceStatus
  remarks     String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  student     Student  @relation(fields: [studentId], references: [id])
  
  @@unique([studentId, date])
  @@index([studentId])
  @@index([date])
  @@map("attendance")
}

model Payment {
  id          String   @id @default(uuid())
  studentId   String
  amount      Float
  type        PaymentType
  method      PaymentMethod
  status      PaymentStatus @default(PENDING)
  dueDate     DateTime?
  paidDate    DateTime?
  description String?
  receiptUrl  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  student     Student  @relation(fields: [studentId], references: [id])
  
  @@index([studentId])
  @@index([status])
  @@index([dueDate])
  @@map("payments")
}

// ==========================================
// CRM Pro.cc (Hospital) Models
// ==========================================

model Patient {
  id            String   @id @default(uuid())
  userId        String?  @unique
  firstName     String
  lastName      String
  dateOfBirth   DateTime
  gender        Gender
  email         String   @unique
  phone         String
  address       String?
  bloodType     String?
  allergies     String[]
  medicalHistory String?
  
  // Emergency contact
  emergencyContactName  String?
  emergencyContactPhone String?
  emergencyContactRelation String?
  
  status        PatientStatus @default(ACTIVE)
  registrationDate DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User?    @relation(fields: [userId], references: [id])
  appointments  Appointment[]
  admissions    Admission[]
  bills         Bill[]
  
  @@index([email])
  @@index([status])
  @@map("patients")
}

model Doctor {
  id            String   @id @default(uuid())
  userId        String?  @unique
  firstName     String
  lastName      String
  email         String   @unique
  phone         String
  specialization String
  qualification String
  licenseNumber String   @unique
  photoUrl      String?
  
  status        DoctorStatus @default(ACTIVE)
  joinDate      DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User?    @relation(fields: [userId], references: [id])
  appointments  Appointment[]
  admissions    Admission[]
  
  @@index([email])
  @@index([specialization])
  @@index([status])
  @@map("doctors")
}

model Appointment {
  id          String   @id @default(uuid())
  patientId   String
  doctorId    String
  dateTime    DateTime
  duration    Int      // in minutes
  type        AppointmentType
  status      AppointmentStatus @default(SCHEDULED)
  notes       String?
  diagnosis   String?
  prescription String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  patient     Patient  @relation(fields: [patientId], references: [id])
  doctor      Doctor   @relation(fields: [doctorId], references: [id])
  
  @@index([patientId])
  @@index([doctorId])
  @@index([dateTime])
  @@index([status])
  @@map("appointments")
}

model Admission {
  id            String   @id @default(uuid())
  patientId     String
  doctorId      String
  admissionDate DateTime
  dischargeDate DateTime?
  department    String
  bedNumber     String?
  reason        String
  diagnosis     String?
  treatment     String?
  status        AdmissionStatus @default(ADMITTED)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  patient       Patient  @relation(fields: [patientId], references: [id])
  doctor        Doctor   @relation(fields: [doctorId], references: [id])
  
  @@index([patientId])
  @@index([doctorId])
  @@index([status])
  @@map("admissions")
}

model Bed {
  id          String   @id @default(uuid())
  bedNumber   String   @unique
  department  String
  type        BedType
  status      BedStatus @default(AVAILABLE)
  floor       Int?
  room        String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([department])
  @@index([status])
  @@map("beds")
}

model Bill {
  id          String   @id @default(uuid())
  patientId   String
  totalAmount Float
  paidAmount  Float    @default(0)
  discount    Float    @default(0)
  tax         Float    @default(0)
  status      BillStatus @default(PENDING)
  dueDate     DateTime?
  paidDate    DateTime?
  items       Json     // Array of bill items
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  patient     Patient  @relation(fields: [patientId], references: [id])
  
  @@index([patientId])
  @@index([status])
  @@map("bills")
}

// ==========================================
// Enums
// ==========================================

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum StudentStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  GRADUATED
}

enum TeacherStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
}

enum ExamType {
  QUIZ
  MIDTERM
  FINAL
  ASSIGNMENT
  PROJECT
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

enum PaymentType {
  TUITION
  BOOKS
  UNIFORM
  TRANSPORT
  OTHER
}

enum PaymentMethod {
  CASH
  CARD
  BANK_TRANSFER
  ONLINE
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

enum PatientStatus {
  ACTIVE
  INACTIVE
  DECEASED
}

enum DoctorStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
}

enum AppointmentType {
  CONSULTATION
  FOLLOWUP
  EMERGENCY
  SURGERY
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum AdmissionStatus {
  ADMITTED
  DISCHARGED
  TRANSFERRED
}

enum BedType {
  GENERAL
  ICU
  PRIVATE
  SEMI_PRIVATE
}

enum BedStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
  RESERVED
}

enum BillStatus {
  PENDING
  PARTIAL
  PAID
  OVERDUE
  CANCELLED
}
```

Voulez-vous que je continue avec les fichiers du serveur (server.ts, middleware, services, controllers) ? 🚀
