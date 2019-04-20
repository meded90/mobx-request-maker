export const errorTypes = {
  // LIMIT: 'LIMIT',
  // NOTIFICATION: 'NOTIFICATION',
  INCORRECT_STATUS: 'INCORRECT_STATUS',
  INCORRECT_OBJECT: 'INCORRECT_OBJECT',
  // INCORRECT_TYPE: 'INCORRECT_TYPE',
  // INCORRECT_VALUE: 'INCORRECT_VALUE',
  // INCORRECT_MIME_TYPE: 'INCORRECT_MIME_TYPE',
  // MAX_FILE_SIZE_EXCEEDED: 'MAX_FILE_SIZE_EXCEEDED',
  // WRONG_SERVER_STATUS: 'WRONG_SERVER_STATUS',
  // SILENT: 'SILENT',
  INCORRECT_RESPONSE: 'INCORRECT_RESPONSE',
  // NOTIFICATION_WARN: 'NOTIFICATION_WARN',
  SERVER_RESPONSE: 'SERVER_RESPONSE',
  // INCORRECT_DECORATOR_CALL: 'INCORRECT_DECORATOR_CALL',
};

export interface DataError extends Error {
  data?: any;
}

export function createError(name: string, message: string, data?: any): DataError {
  const newError: DataError = new Error(message);

  newError.name = name;
  if (data) {
    newError.data = data;
  }

  return newError;
}
