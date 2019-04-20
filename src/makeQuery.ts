import { AxiosRequestConfig } from "axios";
import { IAbstractParams, IAbstractRespond, IQuery, IRequestMakerScheme } from "./types";
import { isMethod, isUrl, isPlainObject, isNil, isFunction } from "./utils";
import { createError, errorTypes } from "./errors";

export async function makeQuery<P = IAbstractParams, R = IAbstractRespond>(
  scheme: IRequestMakerScheme<P, R>,
  params?: P,
  requestConfig: AxiosRequestConfig = {}
): Promise<IQuery> {
  if (!scheme || !isPlainObject(scheme)) {
    throw createError(errorTypes.INCORRECT_OBJECT, `Bad query scheme`);
  }

  if (!(isNil(params) || isPlainObject(params))) {
    throw createError(errorTypes.INCORRECT_OBJECT, `Params not valid`);
  }

  const url = isFunction(scheme.url) ? scheme.url(params) : scheme.url;

  if (!isUrl(url)) {
    throw createError(errorTypes.INCORRECT_OBJECT, `URL not valid`);
  }

  if (!isMethod(scheme.method)) {
    throw createError(errorTypes.INCORRECT_OBJECT, `Method not valid`);
  }

  return {
    params,
    method: scheme.method,
    url,
    withCredentials: true,
    ...requestConfig,
    ...(scheme.requestConfig || {}),
  };
}
