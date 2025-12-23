// ==========================================
// src/services/patient.service.ts
// ==========================================

import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.config.js';
import { NotFoundError } from '../utils/errors.js';
import { getPagination, getPaginationMetadata } from '../utils/validator.utils.js';

class PatientService {
  /**
   * Get all patients with pagination and filters
   */
  async getPatients(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.PatientWhereInput = {};

    // Apply filters
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status as any;
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              email: true,
              isActive: true,
            },
          },
          appointments: {
            take: 5,
            orderBy: { dateTime: 'desc' },
            include: {
              doctor: {
                select: {
                  firstName: true,
                  lastName: true,
                  specialization: true,
                },
              },
            },
          },
          admissions: {
            where: { status: 'ADMITTED' },
          },
          bills: {
            where: { status: { not: 'PAID' } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      patients,
      pagination: getPaginationMetadata(page, limit, total),
    };
  }

  /**
   * Get patient by ID
   */
  async getPatientById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
            lastLogin: true,
          },
        },
        appointments: {
          orderBy: { dateTime: 'desc' },
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true,
                phone: true,
              },
            },
          },
        },
        admissions: {
          orderBy: { admissionDate: 'desc' },
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true,
              },
            },
          },
        },
        bills: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundError('Patient');
    }

    return patient;
  }

  /**
   * Create new patient
   */
  async createPatient(data: Prisma.PatientCreateInput) {
    return await prisma.patient.create({
      data,
      include: {
        user: true,
      },
    });
  }

  /**
   * Update patient
   */
  async updatePatient(id: string, data: Prisma.PatientUpdateInput) {
    const patient = await prisma.patient.findUnique({ where: { id } });

    if (!patient) {
      throw new NotFoundError('Patient');
    }

    return await prisma.patient.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  /**
   * Delete patient
   */
  async deletePatient(id: string) {
    const patient = await prisma.patient.findUnique({ where: { id } });

    if (!patient) {
      throw new NotFoundError('Patient');
    }

    await prisma.patient.delete({ where: { id } });
  }

  /**
   * Get patient statistics
   */
  async getPatientStats(id: string) {
    const patient = await this.getPatientById(id);

    // Count appointments by status
    const totalAppointments = patient.appointments.length;
    const completedAppointments = patient.appointments.filter(
      a => a.status === 'COMPLETED'
    ).length;
    const upcomingAppointments = patient.appointments.filter(
      a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
    ).length;

    // Count admissions
    const totalAdmissions = patient.admissions.length;
    const currentAdmissions = patient.admissions.filter(
      a => a.status === 'ADMITTED'
    ).length;

    // Calculate billing
    const totalBilled = patient.bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPaid = patient.bills.reduce((sum, b) => sum + b.paidAmount, 0);
    const outstandingBalance = totalBilled - totalPaid;

    return {
      patientId: id,
      totalAppointments,
      completedAppointments,
      upcomingAppointments,
      cancelledAppointments: patient.appointments.filter(
        a => a.status === 'CANCELLED'
      ).length,
      totalAdmissions,
      currentAdmissions,
      totalBilled,
      totalPaid,
      outstandingBalance,
      hasOutstandingBalance: outstandingBalance > 0,
    };
  }

  /**
   * Get patient medical history
   */
  async getPatientMedicalHistory(id: string) {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: id,
        status: 'COMPLETED',
      },
      orderBy: { dateTime: 'desc' },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });

    const admissions = await prisma.admission.findMany({
      where: { patientId: id },
      orderBy: { admissionDate: 'desc' },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });

    return {
      appointments,
      admissions,
    };
  }

  /**
   * Search patients
   */
  async searchPatients(query: string) {
    return await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ],
        status: 'ACTIVE',
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
      },
    });
  }
}

export const patientService = new PatientService();

// ==========================================
// src/controllers/hospital/patients.controller.ts
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { patientService } from '../../services/patient.service.js';
import { z } from 'zod';

// Validation schemas
const createPatientSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().transform(str => new Date(str)),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  email: z.string().email(),
  phone: z.string(),
  address: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medicalHistory: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
});

export class PatientsController {
  /**
   * Get all patients
   * GET /api/v1/hospital/patients
   */
  async getPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = querySchema.parse(req.query);
      
      const result = await patientService.getPatients(params);
      
      res.status(200).json({
        status: 'success',
        data: result.patients,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient by ID
   * GET /api/v1/hospital/patients/:id
   */
  async getPatientById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const patient = await patientService.getPatientById(id);
      
      res.status(200).json({
        status: 'success',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new patient
   * POST /api/v1/hospital/patients
   */
  async createPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createPatientSchema.parse(req.body);
      
      const patient = await patientService.createPatient(data);
      
      res.status(201).json({
        status: 'success',
        message: 'Patient créé avec succès',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update patient
   * PATCH /api/v1/hospital/patients/:id
   */
  async updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = updatePatientSchema.parse(req.body);
      
      const patient = await patientService.updatePatient(id, data);
      
      res.status(200).json({
        status: 'success',
        message: 'Patient mis à jour avec succès',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete patient
   * DELETE /api/v1/hospital/patients/:id
   */
  async deletePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      await patientService.deletePatient(id);
      
      res.status(200).json({
        status: 'success',
        message: 'Patient supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient statistics
   * GET /api/v1/hospital/patients/:id/stats
   */
  async getPatientStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const stats = await patientService.getPatientStats(id);
      
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient medical history
   * GET /api/v1/hospital/patients/:id/medical-history
   */
  async getPatientMedicalHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const history = await patientService.getPatientMedicalHistory(id);
      
      res.status(200).json({
        status: 'success',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search patients
   * GET /api/v1/hospital/patients/search
   */
  async searchPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'Query parameter "q" is required',
        });
        return;
      }
      
      const patients = await patientService.searchPatients(q);
      
      res.status(200).json({
        status: 'success',
        data: patients,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const patientsController = new PatientsController();

// ==========================================
// src/routes/hospital/patients.routes.ts
// ==========================================

import { Router } from 'express';
import { patientsController } from '../../controllers/hospital/patients.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/hospital/patients/search
 * @desc    Search patients
 * @access  Private (Doctor, Nurse, Secretary, Admin)
 */
router.get('/search', 
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'SECRETARY'),
  (req, res, next) => patientsController.searchPatients(req, res, next)
);

/**
 * @route   GET /api/v1/hospital/patients
 * @desc    Get all patients
 * @access  Private (Doctor, Nurse, Secretary, Admin)
 */
router.get('/', 
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'SECRETARY'),
  (req, res, next) => patientsController.getPatients(req, res, next)
);

/**
 * @route   GET /api/v1/hospital/patients/:id
 * @desc    Get patient by ID
 * @access  Private (Doctor, Nurse, Secretary, Admin, Patient themselves)
 */
router.get('/:id', 
  (req, res, next) => patientsController.getPatientById(req, res, next)
);

/**
 * @route   POST /api/v1/hospital/patients
 * @desc    Create new patient
 * @access  Private (Secretary, Admin)
 */
router.post('/', 
  authorize('ADMIN', 'SECRETARY'),
  (req, res, next) => patientsController.createPatient(req, res, next)
);

/**
 * @route   PATCH /api/v1/hospital/patients/:id
 * @desc    Update patient
 * @access  Private (Secretary, Admin)
 */
router.patch('/:id', 
  authorize('ADMIN', 'SECRETARY'),
  (req, res, next) => patientsController.updatePatient(req, res, next)
);

/**
 * @route   DELETE /api/v1/hospital/patients/:id
 * @desc    Delete patient
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  authorize('ADMIN'),
  (req, res, next) => patientsController.deletePatient(req, res, next)
);

/**
 * @route   GET /api/v1/hospital/patients/:id/stats
 * @desc    Get patient statistics
 * @access  Private (Doctor, Nurse, Admin)
 */
router.get('/:id/stats', 
  authorize('ADMIN', 'DOCTOR', 'NURSE'),
  (req, res, next) => patientsController.getPatientStats(req, res, next)
);

/**
 * @route   GET /api/v1/hospital/patients/:id/medical-history
 * @desc    Get patient medical history
 * @access  Private (Doctor, Admin)
 */
router.get('/:id/medical-history', 
  authorize('ADMIN', 'DOCTOR'),
  (req, res, next) => patientsController.getPatientMedicalHistory(req, res, next)
);

export default router;
