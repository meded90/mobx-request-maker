import { String, Unknown } from "runtypes";
import { IAbstractObject, IMethod } from "./types";

export function get<R = any>(object: any, keys: string | string[], defaultVal?: any): R {
  const keysResolve = Array.isArray(keys) ? keys : keys.replace(/(\[(\d)\])/g, '.$2').split('.');
  object = object[keysResolve[0]];
  if (object && keysResolve.length > 1) {
    return get(object, keysResolve.slice(1), defaultVal);
  }
  return object === undefined ? defaultVal : object;
}

export function isFunction(v: any): v is (...arg: any[]) => any {
  return typeof v === 'function';
}

export function isPlainObject(v: any): v is IAbstractObject {
  return Object.prototype.toString.call(v) === '[object Object]';
}

export function isNil(v: any): v is void {
  return Unknown.validate(v).success
}

export function isString(str: any): str is string {
  return String.validate(str).success
}


export function isMethod(method: any): method is IMethod {
  if (!isString(method)) {
    return false;
  }
  return method === 'get' || method === 'post' || method === 'delete' || method === 'patch';
}

export function isUrl(url: any): url is string {
  if (!isString(url)) {
    return false;
  }
  if (!/^\/([\w\-\/]+)$/g.test(url)) {
    return false;
  }
  return true;
}
