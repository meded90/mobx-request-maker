import { IAbstractParams, IAbstractRespond, IRequestMakerScheme, IQuery } from "./types";
import { isNil, isFunction } from "./utils";
import { createError, errorTypes } from "./errors";

export function validatingParams<P = IAbstractParams, R = IAbstractRespond>(
  scheme: IRequestMakerScheme<P, R>
) {
  return async function(query: IQuery): Promise<IQuery> {
    if (isNil(query.params) && isNil(scheme.params)) {
      return query;
    }
    if (isNil(query.params) && !isNil(scheme.params)) {
      throw createError(errorTypes.INCORRECT_OBJECT, `query.params is empty`);
    }

    if (!isNil(query.params) && isNil(scheme.params)) {
      throw createError(errorTypes.INCORRECT_OBJECT, `scheme.params is empty`);
    }

    if (!isFunction(scheme.params.check) || !isFunction(scheme.params.validate)) {
      throw createError(errorTypes.INCORRECT_OBJECT, `scheme.params is not Runtype`);
    }

    const result = scheme.params.validate(query.params);
    if (result.success === false) {
      throw createError(errorTypes.INCORRECT_OBJECT, result.message);
    }

    return query;
  };
}
