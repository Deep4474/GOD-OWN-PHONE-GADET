// Rate limiter for authentication
globalThis.RateLimiter = {
    attempts: new Map(),
    maxAttempts: 3,
    duration: 60000, // 1 minute

    loadState: function() {
        try {
            const saved = localStorage.getItem('rateLimiterState');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.attempts = new Map(Object.entries(parsed));
            }
        } catch (e) {
            console.error('Error loading rate limiter state:', e);
        }
    },

    saveState: function() {
        try {
            const state = Object.fromEntries(this.attempts);
            localStorage.setItem('rateLimiterState', JSON.stringify(state));
        } catch (e) {
            console.error('Error saving rate limiter state:', e);
        }
    },

    checkLimit: function(key) {
        this.loadState();
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
        this.saveState();
        return true;
    }
};

// Initialize rate limiter state
globalThis.RateLimiter.loadState();
