export default class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    const capture = (
      Error as unknown as {
        captureStackTrace?: (
          target: object,
          ctor?: new (...args: unknown[]) => unknown,
        ) => void;
      }
    ).captureStackTrace;
    if (capture) {
      capture(this, this.constructor as new (...args: unknown[]) => unknown);
    }
  }
}
