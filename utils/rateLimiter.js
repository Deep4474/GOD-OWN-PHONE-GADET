// Rate limiting utility
class RateLimiter {
    constructor(maxAttempts = 3, duration = 60000) {
        this.maxAttempts = maxAttempts;
        this.duration = duration;
        this.attempts = new Map();
    }

    async checkLimit(key) {
        const now = Date.now();
        const userAttempts = this.attempts.get(key) || { count: 0, timestamp: now };

        // Reset if duration has passed
        if (now - userAttempts.timestamp >= this.duration) {
            userAttempts.count = 0;
            userAttempts.timestamp = now;
        }

        // Check if limit exceeded
        if (userAttempts.count >= this.maxAttempts) {
            const remainingTime = Math.ceil((this.duration - (now - userAttempts.timestamp)) / 1000);
            throw new Error(`Too many attempts. Please wait ${remainingTime} seconds.`);
        }

        // Increment attempt count
        userAttempts.count++;
        this.attempts.set(key, userAttempts);
        
        return true;
    }
}

// Export the rate limiter
const authRateLimiter = new RateLimiter(3, 60000); // 3 attempts per minute
export { authRateLimiter };
