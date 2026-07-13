export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export const ensure = (condition, message) => {
  if (!condition) {
    throw new ValidationError(message);
  }
};
