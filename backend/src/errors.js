export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'internal_error') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function notFound(message = 'Recurso no encontrado') {
  return new AppError(message, 404, 'not_found');
}

