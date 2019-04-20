import { AxiosRequestConfig } from 'axios';
import { action, computed, observable, toJS } from 'mobx';
import { IAbstractParams, IAbstractRespond, IRequestMakerScheme, statusFetching } from './types';
import { makeQuery } from './makeQuery';
import { validatingParams } from './validatingParams';
import { makeRequest } from './makeRequest';
import { getParam } from './getParam';
import { validatingResponse } from "./validatingResponse";
import { isFunction, isNil } from "./utils";

export default class RequestMaker<P = IAbstractParams, R = IAbstractRespond> {
  public static globalRequestConfig: AxiosRequestConfig = {};
  public static errorUserNotification: (message: string) => void;
  public static errorDevLog: (error: Error, callFunction?: string, key?: string,) => void = (callFunction, key, error) => console.error(
    callFunction ? 'call: ' + callFunction + '\n' : '',
    key ? 'path: ' + key + '\n' : '',
    error);

  @computed
  get isLoading() {
    return this.status === 'fetching';
  }

  @observable
  public error: string = '';
  @observable
  public status: statusFetching = 'init';
  @observable
  public data: R;
  @observable
  public params: P;

  public path: string;

  // toto save all instanse
  constructor(public scheme: IRequestMakerScheme<P, R>) {
    if (!this.scheme.method) {
      this.scheme.method = 'get';
    }
    if (!this.scheme.url) {
      throw new Error('URL is required in RequestMaker');
    }

    if (!this.scheme.response) {
      throw new Error('Response schema is required in RequestMaker');
    }
    if (this.scheme.paramsDefault) {
      this.params = this.scheme.paramsDefault;
    }

  }

  public checkPath() {
    try {
      throw new Error('check path');
    } catch (e) {
      const errTease = e.stack;
      const lastIndex = errTease.lastIndexOf(this.constructor.name);
      const start = errTease.indexOf('at ', lastIndex) + 3;
      const end = errTease.indexOf('\n ', start);
      this.path = errTease.slice(start, end);
    }
  }

  @action.bound
  public fetch(params?: P): Promise<void> {
    this.checkPath();
    if (this.status === 'fetching') {
      return Promise.resolve();
    }
    this.status = 'fetching';
    if (params) {
      if (!this.params) {
        this.params = {} as P;
      }
      Object.assign(this.params, params);
    }

    return makeQuery(this.scheme, toJS(this.params), RequestMaker.globalRequestConfig)
      .then(validatingParams(this.scheme))
      .then(makeRequest)
      .then(getParam('data'))
      .then(this.parseData)
      .then(validatingResponse(this.scheme))
      .then(this.fetchSuccess)
      .then(this.afterFetchSuccess)
      .catch(this.strategics)
      .catch(this.fetchError);
  }

  public parseData(data: any): R {
    if (isFunction(this.scheme.parseData)) {
      return this.scheme.parseData(data);
    }
    return data;
  }

  public afterFetchSuccess(data: R) {
    if (isFunction(this.scheme.afterFetchSuccess)) {
      return this.scheme.afterFetchSuccess(data);
    }
  }

  public afterFetchError(e: Error): Error {
    if (isFunction(this.scheme.afterFetchError)) {
      return this.scheme.afterFetchError(e);
    }
    return e;
  }

  @action.bound
  private fetchSuccess(data: R): Promise<R> {
    this.status = 'success';

    if (this.scheme.paramsDefault) {
      this.params = this.scheme.paramsDefault;
    }

    this.data = data;

    return Promise.resolve(data);
  }

  @action.bound
  private fetchError(error: Error): Promise<void> {
    error = this.afterFetchError(error);
    this.status = 'error';
    this.error = error.message;

    if ((isNil(this.scheme.isNotification) || this.scheme.isNotification === true) && isFunction(RequestMaker.errorUserNotification)) {
      RequestMaker.errorUserNotification(error.message)
    }

    if (isFunction(RequestMaker.errorDevLog)) {
      // @ts-ignore
      RequestMaker.errorDevLog(error, this.path, error.key)
    }

    return Promise.resolve();
  }

  private async strategics(error: Error): Promise<void> {
    // console.log(`––– strategics `, error, `\n –––`);
    // TODO:  написать политики обработки реквестов

    throw error;
  }
}
