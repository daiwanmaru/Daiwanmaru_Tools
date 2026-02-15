import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitConfig {
    url: string;
    token: string;
}

export class RateLimitAdapter {
    private ratelimit: Ratelimit;

    constructor(config: RateLimitConfig) {
        const redis = new Redis({
            url: config.url,
            token: config.token,
        });

        this.ratelimit = new Ratelimit({
            redis: redis,
            limiter: Ratelimit.slidingWindow(5, '10 m'), // 5 jobs per 10 minutes
            analytics: true,
            prefix: '@daiwanmaru/ratelimit',
        });
    }

    async check(identifier: string) {
        const { success, limit, reset, remaining } = await this.ratelimit.limit(identifier);
        return { success, limit, reset, remaining };
    }
}
