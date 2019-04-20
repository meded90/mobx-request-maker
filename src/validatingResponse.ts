import { IAbstractParams, IAbstractRespond, IRequestMakerScheme } from "./types";
import { isNil, isFunction } from "./utils";
import { createError, errorTypes } from "./errors";

export function validatingResponse<P = IAbstractParams, R = IAbstractRespond>(
  scheme: IRequestMakerScheme<P, R>
) {
  return async function(response: R): Promise<R> {
    if (isNil(scheme.response)) {
      throw createError(errorTypes.INCORRECT_OBJECT, `scheme.response is empty`);
    }

    if (!isFunction(scheme.response.check) || !isFunction(scheme.response.validate)) {
      throw createError(errorTypes.INCORRECT_OBJECT, `scheme.response is not Runtype`);
    }

    const result = scheme.response.validate(response);
    if (result.success === false) {
      throw createError(errorTypes.INCORRECT_OBJECT, result.message);
    }

    return response;
  };
}
