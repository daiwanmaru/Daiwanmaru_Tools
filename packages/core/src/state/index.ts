import { JobStatus } from '@prisma/client';

export const CAN_TRANSITION: Record<JobStatus, JobStatus[]> = {
    PENDING: [JobStatus.QUEUED, JobStatus.FAILED],
    QUEUED: [JobStatus.PROCESSING, JobStatus.FAILED],
    PROCESSING: [JobStatus.COMPLETED, JobStatus.FAILED],
    COMPLETED: [],
    FAILED: [JobStatus.QUEUED], // Allow retry
};

export function isValidTransition(from: JobStatus, to: JobStatus): boolean {
    return CAN_TRANSITION[from].includes(to);
}
