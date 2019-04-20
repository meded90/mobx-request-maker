import { Runtype } from "runtypes";
import { AxiosRequestConfig } from "axios";

export type IMethod = 'get' | 'post' | 'delete' | 'patch' | string;

export type statusFetching = 'init' | 'fetching' | 'success' | 'error';

export interface IAbstractObject {
  [key: string]: any;
}


export type IAbstractParams = IAbstractObject;
export type IAbstractRespond = IAbstractObject | IAbstractObject[];

export type IDynamicUrl<P> = (params?: P) => string;


export interface IRequestMakerScheme<P = IAbstractParams, R = IAbstractRespond> {
  url: string | IDynamicUrl<P>;
  paramsDefault?: P;
  params?: Runtype<P>;
  response: Runtype<R>;
  method: IMethod;
  isNotification?: boolean;
  requestConfig?: AxiosRequestConfig;

  parseData?(data: any): R;

  afterFetchSuccess?(data: R): void;

  afterFetchError?(e: Error): Error;
}

export interface IQuery extends AxiosRequestConfig {
  url: string;
  method: IMethod
  params?: IAbstractObject;
}
