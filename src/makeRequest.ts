import axios, { AxiosPromise, AxiosRequestConfig } from "axios";
import { createError, errorTypes } from "./errors";
import { IQuery } from "./types";
import { isPlainObject, isString } from "./utils";

export function makeRequest<T = any>({
                                       url,
                                       method,
                                       params,
                                       ...config
                                     }: IQuery & AxiosRequestConfig): AxiosPromise<T> {
  return new Promise(function makeRequestPromise(resolve, reject) {
    if (!isString(url) || !isString(method)) {
      return reject(
        createError(errorTypes.INCORRECT_OBJECT, 'makeRequest: incorect query object')
      );
    }

    const params: AxiosRequestConfig = {
      ...config,
      url,
      method,
    };

    if (isPlainObject(params)) {
      // Very strange behavior of Axios :(
      params[method === 'get' ? 'params' : 'data'] = params;
    }

    return axios(params)
      .then(response => {

        return resolve(response);
      })
      .catch(e => {

        if (e.response && e.response.data && e.response.data.error) {
          return reject(
            createError(e.response.data.error.errorType, e.response.data.error.message)
          );
        }

        if (
          isString(e.message) &&
          e.message.indexOf('Request failed with status code') !== -1
        ) {
          return reject(createError(errorTypes.INCORRECT_STATUS, e.message.replace(/\D/g, '')));
        }

        return reject(e);
      });

  });
}
