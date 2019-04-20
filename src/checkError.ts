import { errorTypes, createError } from "./errors";
import { isString } from "./utils";

export function checkError<T>(data: T & { error?: string; result?: boolean }): Promise<T> {
  if (isString(data.error)) {
    return Promise.reject(createError(errorTypes.SERVER_RESPONSE, data.error, data));
  }

  if (data.result === false) {
    return Promise.reject(
      createError(errorTypes.SERVER_RESPONSE, 'Expected server response false', data)
    );
  }

  return Promise.resolve(data);
}
