class RateLimiter {
    constructor(maxAttempts = 3, duration = 60000) {
        this.maxAttempts = maxAttempts;
        this.duration = duration;
        this.attempts = new Map();
    }

    checkLimit(key) {
        const now = Date.now();
        const userAttempts = this.attempts.get(key) || { count: 0, timestamp: now };

        if (now - userAttempts.timestamp >= this.duration) {
            userAttempts.count = 0;
            userAttempts.timestamp = now;
        }

        if (userAttempts.count >= this.maxAttempts) {
            const remainingTime = Math.ceil((this.duration - (now - userAttempts.timestamp)) / 1000);
            throw new Error(`Too many attempts. Please wait ${remainingTime} seconds before trying again.`);
        }

        userAttempts.count++;
        this.attempts.set(key, userAttempts);
        return true;
    }
}

const authLimiter = new RateLimiter();
