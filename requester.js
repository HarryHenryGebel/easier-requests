/**
 * @file Provide the requester class.
 * @author Harry Henry Gebel <hhgebel@gmail.com>
 * @copyright 2020 Harry Henry Gebel
 * @license MIT
 * @version 0.0.3
 * @module easier-requests
 * @since 0.0.0
 */
'use strict';

import axios from 'axios';
import {IDInUseError,
        RequestNotCompleteError,
        InvalidRequestError,
        UnbalancedParametersError} from './errors';

/**
 * Class representing actions to perform HTTP requests and cache their
 * responses for later retrieval.
 * @since 0.0.0
 */
class Requester {
  /**
   * Create a Requester
   * @since 0.0.0
   */
  constructor() {
    // holds responses awaiting retrieval
    this._cachedResponses = {};
    this._cachedErrors = {};

    // in flight request IDs
    this._inFlightRequests = {};

    // Updated every time a unique ID is generated, in order to help
    // ensure generated ids are in fact unique.
    this._idSerialNumber = 0;

    this._defaultOptions = {
       // should we throw an error when a response fails?
      throwOnFailure: true
    };

    // copy in order to preserve original
    this._options = {...this._defaultOptions};
  }

  /**
   * Generates a unique ID to prevent ID name clashes. This function
   * will never generate the same ID twice during the existence of a
   * specific instance of the Requester class.
   * @since 0.0.1
   * @param {string} [prefix = ''] - String which will be applied as the
   * first part of every generated unique ID.
   * @return {string} The generated ID. Returned IDs have the
   * format "${prefix}#${serial number}#${timestamp}", where prefix is
   * a string prefix optionally provided by the user.
   */
  createUniqueID(prefix = '') {
    this._idSerialNumber++;

    return `${prefix}#${this._idSerialNumber}#${Date.now()}`;
  }

  /**
   * Wrap variable parameters into a params object
   * @private
   * @since 0.0.3
   * @param {string[]} params - Parameters of request. Each request
   * parameter should use two function parameters, the first the name
   * of the parameter and the second it's value. The number of
   * arguments in params should always be even.
   * @return {Object} Parameters wrapped into a params object suitable
   * for passing to Requester._request.
   * @throws {UnbalancedParametersError}
   */
  _wrapParams(params) {
    if (Array.isArray(params)) {
      // handle request parameters
      if (params.length % 2 != 0)
        throw new UnbalancedParametersError(
          "Each request parameter must have a parameter name and a value.");

      const parameters = {}; // gather params into object
      for (let i = 0; i < params.length; i += 2)
        parameters[params[i]] = params[i + 1];

      return parameters;
    }
    else {
      return params;
    }
  }

  /**
   * Perform an HTTP DELETE request and cache response
   * @async
   * @since 0.0.3
   * @param {string} url - URL of request
   * @param {string} id - Unique ID of request, used to retrieve results
   * @param {...string} params - Parameters of request. Each request
   * parameter should use two function parameters, the first the name
   * of the parameter and the second it's value. The number of
   * arguments in params should always be even.
   */
  async delete(url, id, ...params) {
    await this._request('delete',
                        url,
                        id,
                        undefined,
                        this._wrapParams(params));
  }

  /**
   * Perform an HTTP GET request and cache response
   * @async
   * @since 0.0.1
   * @param {string} url - URL of request
   * @param {string} id - Unique ID of request, used to retrieve results
   * @param {...string} params - Parameters of request. Each request
   * parameter should use two function parameters, the first the name
   * of the parameter and the second it's value. The number of
   * arguments in params should always be even.
   */
  async get(url, id, ...params) {
    await this._request('get', url, id, undefined, this._wrapParams(params));
  }

  /**
   * Perform an HTTP PATCH request and cache response
   * @async
   * @since 0.0.3
   * @param {string} url - URL of request
   * @param {string} id - Unique ID of request, used to retrieve results
   * @param {Object} data - Data for request.
   * @param {...string} params - Parameters of request. Each request
   * parameter should use two function parameters, the first the name
   * of the parameter and the second it's value. The number of
   * arguments in params should always be even.
   */
  async patch(url, id, data, ...params) {
    await this._request('patch', url, id, data, this._wrapParams(params));
  }

  /**
   * Perform an HTTP POST request and cache response
   * @async
   * @since 0.0.3
   * @param {string} url - URL of request
   * @param {string} id - Unique ID of request, used to retrieve results
   * @param {Object} data - Data for request.
   * @param {...string} params - Parameters of request. Each request
   * parameter should use two function parameters, the first the name
   * of the parameter and the second it's value. The number of
   * arguments in params should always be even.
   */
  async post(url, id, data, ...params) {
    await this._request('post', url, id, data, this._wrapParams(params));
  }

  /**
   * Perform an HTTP PUSH request and cache response
   * @async
   * @since 0.0.3
   * @param {string} url - URL of request
   * @param {string} id - Unique ID of request, used to retrieve results
   * @param {Object} data - Data for request.
   * @param {...string} params - Parameters of request. Each request
   * parameter should use two function parameters, the first the name
   * of the parameter and the second it's value. The number of
   * arguments in params should always be even.
   */
  async push(url, id, data, ...params) {
    await this._request('push', url, id, data, this._wrapParams(params));
  }

  /**
   * Perform an axios request
   * @async
   * @private
   * @since 0.0.3
   * @param {string} method - HTTP method of request to performed
   * (GET, POST, etc.)
   * @param {string} url - URL of request
   * @param {string} id - Unique ID of request, used to retrieve results
   * @param {Object} data - Data for POST, PUT, and PATCH
   * requests. Ignored for GET requests.
   * @param {Object} params - Parameters of request. Each request
   * parameter should use two function parameters, the first the name
   * of the parameter and the second it's value. The number of
   * arguments in params should always be even.
   */
  async _request(method, url, id, data, params) {

    const config = {method: method,
                    params: params,
                    url: url,
                    data: data};

    // id cannot be in use
    if (id in this._cachedResponses || id in this._inFlightRequests)
      throw new IDInUseError(`ID ${id} is already in use`);

    const caller = this; // store this for use in callbacks
    // cache id with promise
    this._inFlightRequests[id] = axios.request(config)
    // on success, set error to undefined, on failure set response to
    // undefined
      .then(function (response) {
        caller._cachedResponses[id] = response;
        caller._cachedErrors[id] = undefined;
      })
      .catch(function (error) {
        caller._cachedResponses[id] = undefined;
        caller._cachedErrors[id] = error;
        // throw error if set in options
        if (caller._options.throwOnFailure) {
          // control flow will never reach end of function if thrown
          delete caller._inFlightRequests[id];
          throw error;
        }
      });
    await this._inFlightRequests[id];

    // get rid of cached ID since we are no longer in flight
    delete this._inFlightRequests[id];
  }

  /**
   * Check if an ID is invalid or in-flight and throw any appropriate
   * errors.
   * @private
   * @since 0.0.1
   * @param {string} id - Id to check for errors
   * @throws {RequestNotCompleteError} Thrown when a response is requested
   * from an in-flight request.
   * @throws {InvalidRequestError} Thrown when an ID does not exist. Caused
   * by a request never having been made or already having been
   * retrieved. Retrieved requests are deleted from the cache
   * to prevent a memory leak on long running apps.
   */
  _responseErrorChecker(id) {
    if (id in this._inFlightRequests)
      throw new RequestNotCompleteError(
        `Request with ID ${id} has not completed.`);
    if (!(id in this._cachedResponses) && !(id in this._inFlightRequests))
      throw new InvalidRequestError(
        `Request with ID ${id}` +
          ' has already been retrieved or was never created.');
  }

  /**
   * Retrieve an error based on it's ID
   * @since 0.0.1
   * @param {string} id - The ID passed into the HTTP request when it
   * was created
   * @return {Object} The error returned. Will be set to undefined
   * if the request succeeded.
   * @throws {RequestNotCompleteError} Thrown when a response is requested
   * from an in-flight request.
   * @throws {InvalidRequestError} Thrown when an ID does not exist. Caused
   * by a request never having been made or already having been
   * retrieved. Retrieved requests are deleted from the cache
   * to prevent a memory leak on long running apps.
   */
  error(id) {
    // check for errors
    this._responseErrorChecker(id);

    if (this._cachedErrors[id] === undefined)
      // do not delete until the response is retrieved
      return undefined;

    const errorReturned = this._cachedErrors[id];
    delete this._cachedErrors[id];
    delete this._cachedResponses[id];
    return errorReturned;
  }

  /**
   * Retrieve a response based on it's ID
   * @since 0.0.0
   * @param {string} id - The ID passed into the HTTP request when it
   * was created
   * @return {Object} The response returned. Will be set to undefined
   * if the request failed.
   * @throws {RequestNotCompleteError} Thrown when a response is requested
   * from an in-flight request.
   * @throws {InvalidRequestError} Thrown when an ID does not exist. Caused
   * by a request never having been made or already having been
   * retrieved. Retrieved requests are deleted from the cache
   * to prevent a memory leak on long running apps.
   */
  response(id) {
    // check for errors
    this._responseErrorChecker(id);


    if (this._cachedResponses[id] === undefined)
      // do not delete until the error is retrieved
      return undefined;

    const response = this._cachedResponses[id];
    delete this._cachedErrors[id];
    delete this._cachedResponses[id];
    return response;
  }

  /** Set new options, or restore to defaults.
  * @since 0.0.3
  * @param {Object} options - Options passed in to function. Options
  * not set in options will be left at current value. If options is an
  * empty object, reset all options to defaults. If options is null,
  * return a copy of the current options.
  * @return {Object} Copy of options after any changes.
  */
  setOptions(options) {
    // test for empty object
    if (Object.keys(options).length === 0)
      this._options = this._defaultOptions;
    else if (options !== null)
      this._options = Object.assign(this._options, options);

    return {...this._options};
  }
}

/**
 * Preconstructed Requester() instance. Requester is designed to be
 * used primarily from this exported instance.
 */
const requester = new Requester();
export default requester;

//  LocalWords:  RequestNotCompleteError InvalidRequestError IDInUseError
//  LocalWords:  idSerialNumber params
