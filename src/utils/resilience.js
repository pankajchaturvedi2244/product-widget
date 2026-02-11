// src/utils/resilience.js
// Resilience patterns: exponentialBackoff, CircuitBreaker, withTimeout, BulkOperationQueue, RateLimiter

export async function exponentialBackoff(
  fn,
  maxRetries = 3,
  initialDelay = 100,
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      const jitter =
        initialDelay * Math.pow(2, attempt) * (1 + (Math.random() - 0.5) * 0.2);
      await new Promise((res) => setTimeout(res, jitter));
    }
  }
}

// RateLimiter class
export class RateLimiter {
  constructor(limit = 5, interval = 1000) {
    this.limit = limit;
    this.interval = interval;
    this.queue = [];
    this.active = 0;
    this.lastReset = Date.now();
  }

  canRequest() {
    if (Date.now() - this.lastReset > this.interval) {
      this.active = 0;
      this.lastReset = Date.now();
    }
    return this.active < this.limit;
  }

  async waitUntilReady() {
    while (!this.canRequest()) {
      await new Promise((res) => setTimeout(res, 50));
    }
    this.active++;
  }
}

export class CircuitBreaker {
  constructor({
    failureThreshold = 5,
    successThreshold = 2,
    timeout = 10000,
  } = {}) {
    this.state = "CLOSED";
    this.failures = 0;
    this.successes = 0;
    this.nextRetry = Date.now();
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.timeout = timeout;
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextRetry) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }
    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _onSuccess() {
    if (this.state === "HALF_OPEN") {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = "CLOSED";
        this.failures = 0;
        this.successes = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  _onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextRetry = Date.now() + this.timeout;
      this.successes = 0;
    }
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      nextRetry: this.nextRetry,
    };
  }
}

export function withTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs),
    ),
  ]);
}

export class BulkOperationQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.queue = [];
    this.active = 0;
  }

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    while (this.active < this.concurrency && this.queue.length) {
      const { fn, resolve, reject } = this.queue.shift();
      this.active++;
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        this.active--;
        this.process();
      }
    }
  }
}
