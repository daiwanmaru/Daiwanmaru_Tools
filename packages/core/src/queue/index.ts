import { Redis } from '@upstash/redis';

export interface QueueConfig {
    url: string;
    token: string;
}

export class QueueAdapter {
    private redis: Redis;
    private queueKey = 'job_queue';

    constructor(config: QueueConfig) {
        this.redis = new Redis({
            url: config.url,
            token: config.token,
        });
    }

    async enqueue(jobId: string) {
        await this.redis.lpush(this.queueKey, jobId);
    }

    async dequeue(): Promise<string | null> {
        return await this.redis.rpop(this.queueKey);
    }

    // Ack is not strictly needed for basic Redis list, but we can implement it if using streams
    // For MVP, we'll keep it simple.
    async ack(jobId: string) {
        // In a simple list RPOP, it's already removed.
        // If we wanted visibility timeout, we'd use a different structure.
        console.log(`Job ${jobId} acknowledged`);
    }

    async retry(jobId: string) {
        await this.enqueue(jobId);
    }
}
