import { errorTypes, createError } from "./errors";
import { get, isNil } from "./utils";

export function getParam(param: string): (data: object) => Promise<any> {
  return response =>
    new Promise(function getResponseDataPromise(resolve, reject) {
      const data = get(response, param);
      return !isNil(data)
        ? resolve(data)
        : reject(
          createError(
            errorTypes.INCORRECT_RESPONSE,
            `Expected server response to have param ${param}`
          )
        );
    });
}
