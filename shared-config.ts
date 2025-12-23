/**
 * Configuration TypeScript partagée
 * School 1cc & CRM Pro.cc
 */

export const SHARED_CONFIG = {
  // Informations globales
  version: '1.0.0',
  author: 'Votre Équipe',
  year: 2024,
  
  // Configuration API
  api: {
    timeout: 30000,
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  },
  
  // Configuration de pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
    pageSizeOptions: [10, 25, 50, 100],
  },
  
  // Configuration des dates
  dateFormats: {
    display: 'dd/MM/yyyy',
    displayWithTime: 'dd/MM/yyyy HH:mm',
    api: 'yyyy-MM-dd',
    apiWithTime: 'yyyy-MM-dd\'T\'HH:mm:ss',
  },
  
  // Configuration des fichiers
  files: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    }
  },
  
  // Configuration des notifications
  notifications: {
    duration: 5000,
    position: 'top-right' as const,
    maxVisible: 3,
  },
  
  // Configuration du stockage local
  storage: {
    prefix: 'app_',
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 jours
  },
  
  // Configuration de validation
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    minPasswordLength: 8,
  }
} as const;

// Types d'export
export type SharedConfig = typeof SHARED_CONFIG;

// Utilitaires de configuration
export class ConfigHelper {
  static getApiHeader(key: string): string | undefined {
    return SHARED_CONFIG.api.headers[key as keyof typeof SHARED_CONFIG.api.headers];
  }
  
  static isValidEmail(email: string): boolean {
    return SHARED_CONFIG.validation.email.test(email);
  }
  
  static isValidPhone(phone: string): boolean {
    return SHARED_CONFIG.validation.phone.test(phone);
  }
  
  static isValidPassword(password: string): boolean {
    return password.length >= SHARED_CONFIG.validation.minPasswordLength;
  }
  
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
  
  static isFileSizeValid(bytes: number): boolean {
    return bytes <= SHARED_CONFIG.files.maxSize;
  }
  
  static isFileTypeAllowed(mimeType: string, category: keyof typeof SHARED_CONFIG.files.allowedTypes): boolean {
    return SHARED_CONFIG.files.allowedTypes[category].includes(mimeType);
  }
}

// Export par défaut
export default SHARED_CONFIG;
