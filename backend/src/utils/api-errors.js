class ApiError extends Error {
  constructor(statusCode, message, error = [], stack = '') {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.error = error;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  logError() {
    console.error(`${this.name}: ${this.message} [StatusCode: ${this.statusCode}]`);
    if (process.env.NODE_ENV !== 'production') {
      console.error(this.stack); // Show stack trace in development environment
    }
  }
}

export { ApiError };
