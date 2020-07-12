/**
 * @file Provide the requester class.
 * @author Harry Henry Gebel <hhgebel@gmail.com>
 * @copyright 2020 Harry Henry Gebel
 * @license MIT
 * @version 0.0.1
 * @module easier-requests
 * @since 0.0.0
 */
'use strict';

import axios from 'axios';
import {IDInUseError,
        RequestNotCompleteError,
        InvalidRequestError} from './errors';

/**
 * Class representing actions to perform HTTP requests and cache their
 * responses for later retrieval.
 * @since 0.0.0
 */
class Requester {
  // TODO implement general request function

  /**
   * Create a Requester
   * @since 0.0.0
   */
  constructor() {
    // holds responses awaiting retrieval
    this.cachedResponses = {};
    this.cachedErrors = {};

    // in flight request IDs
    this.inFlightRequests = {};

    // Updated every time a unique ID is generated, in order to help
    // ensure generated ids are in fact unique.
    this.idSerialNumber = 0;
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
    this.idSerialNumber++;

    return `${prefix}#${this.idSerialNumber}#${Date.now()}`;
  }

  /**
   * Perform an HTTP get request and cache response
   * @async
   * @since 0.0.1
   * @param {string} url - URL of resource to be requested
   * @param {string} id - Unique ID used to refer to request and response
   * @throws {IDInUseError} Thrown when a requested ID is already in use.
   */
  async get(url, id) {
    // id cannot be in use
    if (id in this.cachedResponses || id in this.inFlightRequests)
      throw new IDInUseError(`ID ${id} is already in use`);

    const caller = this; // store this for use in callbacks
    // cache id with promise
    this.inFlightRequests[id] = axios.get(url)
    // on success, set error to undefined, on failure set response to
    // undefined
      .then(function (response) {
        caller.cachedResponses[id] = response;
        caller.cachedErrors[id] = undefined;
      })
      .catch(function (error) {
        caller.cachedResponses[id] = undefined;
        caller.cachedErrors[id] = error;
      });
    await this.inFlightRequests[id];

    // get rid of cached ID since we are no longer in flight
    delete this.inFlightRequests[id];
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
    if (id in this.inFlightRequests)
      throw new RequestNotCompleteError(
        `Request with ID ${id} has not completed.`);
    if (!(id in this.cachedResponses) && !(id in this.inFlightRequests))
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

    if (this.cachedErrors[id] === undefined)
      // do not delete until the response is retrieved
      return undefined;

    const errorReturned = this.cachedErrors[id];
    delete this.cachedErrors[id];
    delete this.cachedResponses[id];
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


    if (this.cachedResponses[id] === undefined)
      // do not delete until the error is retrieved
      return undefined;

    const response = this.cachedResponses[id];
    delete this.cachedErrors[id];
    delete this.cachedResponses[id];
    return response;
  }

  /**
   * Perform an HTTP get request and cache response
   * @async
   * @since 0.0.0
   * @deprecated since 0.0.1 - will not be included in 1.0.0
   * @param {string} url - URL of resource to be requested
   * @param {string} id - Unique ID used to refer to request and response
   * @throws {IDInUseError} Thrown when a requested ID is already in use.
   */
  async httpGet(url, id) {
    await this.get(url, id);
  }
}

/**
 * Preconstructed Requester() instance. Requester is designed to be used primarily from this exported instance.
 */
export const requester = new Requester();

//  LocalWords:  RequestNotCompleteError InvalidRequestError IDInUseError
//  LocalWords:  idSerialNumber
