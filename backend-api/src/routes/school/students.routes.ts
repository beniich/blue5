// ==========================================
// src/services/student.service.ts
// ==========================================

import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.config.js';
import { NotFoundError } from '../utils/errors.js';
import { getPagination, getPaginationMetadata } from '../utils/validator.utils.js';

class StudentService {
  /**
   * Get all students with pagination and filters
   */
  async getStudents(params: {
    page?: number;
    limit?: number;
    search?: string;
    class?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.StudentWhereInput = {};

    // Apply filters
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.class) {
      where.class = params.class;
    }

    if (params.status) {
      where.status = params.status as any;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
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
          exams: {
            take: 5,
            orderBy: { examDate: 'desc' },
          },
          attendances: {
            where: {
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students,
      pagination: getPaginationMetadata(page, limit, total),
    };
  }

  /**
   * Get student by ID
   */
  async getStudentById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
            lastLogin: true,
          },
        },
        exams: {
          orderBy: { examDate: 'desc' },
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundError('Élève');
    }

    return student;
  }

  /**
   * Create new student
   */
  async createStudent(data: Prisma.StudentCreateInput) {
    return await prisma.student.create({
      data,
      include: {
        user: true,
      },
    });
  }

  /**
   * Update student
   */
  async updateStudent(id: string, data: Prisma.StudentUpdateInput) {
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student) {
      throw new NotFoundError('Élève');
    }

    return await prisma.student.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  /**
   * Delete student
   */
  async deleteStudent(id: string) {
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student) {
      throw new NotFoundError('Élève');
    }

    await prisma.student.delete({ where: { id } });
  }

  /**
   * Get student statistics
   */
  async getStudentStats(id: string) {
    const student = await this.getStudentById(id);

    // Calculate average grade
    const avgGrade = student.exams.length > 0
      ? student.exams.reduce((sum, exam) => sum + exam.percentage, 0) / student.exams.length
      : 0;

    // Calculate attendance rate
    const totalAttendance = student.attendances.length;
    const presentCount = student.attendances.filter(a => a.status === 'PRESENT').length;
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    // Calculate payment status
    const totalPayments = student.payments.reduce((sum, p) => sum + p.amount, 0);
    const paidPayments = student.payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = totalPayments - paidPayments;

    return {
      studentId: id,
      averageGrade: Math.round(avgGrade * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      totalExams: student.exams.length,
      totalAttendance,
      presentCount,
      absentCount: student.attendances.filter(a => a.status === 'ABSENT').length,
      totalPayments,
      paidPayments,
      pendingPayments,
    };
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(className: string) {
    return await prisma.student.findMany({
      where: { class: className },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });
  }

  /**
   * Bulk import students
   */
  async bulkImportStudents(students: Prisma.StudentCreateInput[]) {
    return await prisma.student.createMany({
      data: students,
      skipDuplicates: true,
    });
  }
}

export const studentService = new StudentService();

// ==========================================
// src/controllers/school/students.controller.ts
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { studentService } from '../../services/student.service.js';
import { z } from 'zod';

// Validation schemas
const createStudentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().transform(str => new Date(str)),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  class: z.string(),
  section: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  photoUrl: z.string().url().optional(),
  parentName: z.string().optional(),
  parentEmail: z.string().email().optional(),
  parentPhone: z.string().optional(),
  medicalInfo: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  bloodType: z.string().optional(),
});

const updateStudentSchema = createStudentSchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  search: z.string().optional(),
  class: z.string().optional(),
  status: z.string().optional(),
});

export class StudentsController {
  /**
   * Get all students
   * GET /api/v1/school/students
   */
  async getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = querySchema.parse(req.query);
      
      const result = await studentService.getStudents(params);
      
      res.status(200).json({
        status: 'success',
        data: result.students,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student by ID
   * GET /api/v1/school/students/:id
   */
  async getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const student = await studentService.getStudentById(id);
      
      res.status(200).json({
        status: 'success',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new student
   * POST /api/v1/school/students
   */
  async createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createStudentSchema.parse(req.body);
      
      const student = await studentService.createStudent(data);
      
      res.status(201).json({
        status: 'success',
        message: 'Élève créé avec succès',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update student
   * PATCH /api/v1/school/students/:id
   */
  async updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = updateStudentSchema.parse(req.body);
      
      const student = await studentService.updateStudent(id, data);
      
      res.status(200).json({
        status: 'success',
        message: 'Élève mis à jour avec succès',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete student
   * DELETE /api/v1/school/students/:id
   */
  async deleteStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      await studentService.deleteStudent(id);
      
      res.status(200).json({
        status: 'success',
        message: 'Élève supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student statistics
   * GET /api/v1/school/students/:id/stats
   */
  async getStudentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const stats = await studentService.getStudentStats(id);
      
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get students by class
   * GET /api/v1/school/students/class/:className
   */
  async getStudentsByClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { className } = req.params;
      
      const students = await studentService.getStudentsByClass(className);
      
      res.status(200).json({
        status: 'success',
        data: students,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk import students
   * POST /api/v1/school/students/bulk-import
   */
  async bulkImportStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { students } = req.body;
      
      const result = await studentService.bulkImportStudents(students);
      
      res.status(201).json({
        status: 'success',
        message: `${result.count} élèves importés avec succès`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const studentsController = new StudentsController();

// ==========================================
// src/routes/school/students.routes.ts
// ==========================================

import { Router } from 'express';
import { studentsController } from '../../controllers/school/students.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

// All student routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/school/students
 * @desc    Get all students
 * @access  Private (Teacher, Admin)
 */
router.get('/', 
  authorize('ADMIN', 'TEACHER'),
  (req, res, next) => studentsController.getStudents(req, res, next)
);

/**
 * @route   GET /api/v1/school/students/:id
 * @desc    Get student by ID
 * @access  Private (Teacher, Admin, Student themselves)
 */
router.get('/:id', 
  (req, res, next) => studentsController.getStudentById(req, res, next)
);

/**
 * @route   POST /api/v1/school/students
 * @desc    Create new student
 * @access  Private (Admin only)
 */
router.post('/', 
  authorize('ADMIN'),
  (req, res, next) => studentsController.createStudent(req, res, next)
);

/**
 * @route   PATCH /api/v1/school/students/:id
 * @desc    Update student
 * @access  Private (Admin only)
 */
router.patch('/:id', 
  authorize('ADMIN'),
  (req, res, next) => studentsController.updateStudent(req, res, next)
);

/**
 * @route   DELETE /api/v1/school/students/:id
 * @desc    Delete student
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  authorize('ADMIN'),
  (req, res, next) => studentsController.deleteStudent(req, res, next)
);

/**
 * @route   GET /api/v1/school/students/:id/stats
 * @desc    Get student statistics
 * @access  Private (Teacher, Admin, Student themselves)
 */
router.get('/:id/stats', 
  (req, res, next) => studentsController.getStudentStats(req, res, next)
);

/**
 * @route   GET /api/v1/school/students/class/:className
 * @desc    Get students by class
 * @access  Private (Teacher, Admin)
 */
router.get('/class/:className', 
  authorize('ADMIN', 'TEACHER'),
  (req, res, next) => studentsController.getStudentsByClass(req, res, next)
);

/**
 * @route   POST /api/v1/school/students/bulk-import
 * @desc    Bulk import students
 * @access  Private (Admin only)
 */
router.post('/bulk-import', 
  authorize('ADMIN'),
  (req, res, next) => studentsController.bulkImportStudents(req, res, next)
);

export default router;
