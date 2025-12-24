import prisma from '@infrastructure/database/prisma';

interface InputGrade {
    studentId: string;
    value: number;
    comment?: string;
}

export class SubmitGradesUseCase {
    async execute(examId: string, grades: InputGrade[]): Promise<void> {
        // Verify exam exists and is not locked/published if needed
        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) throw new Error('Examen introuvable');

        // Use transaction to ensure all grades are saved or none
        await prisma.$transaction(
            grades.map((grade) =>
                prisma.grade.upsert({
                    where: {
                        examId_studentId: {
                            examId,
                            studentId: grade.studentId,
                        },
                    },
                    update: {
                        value: grade.value,
                        comment: grade.comment,
                    },
                    create: {
                        examId,
                        studentId: grade.studentId,
                        value: grade.value,
                        comment: grade.comment,
                    },
                })
            )
        );
    }
}
