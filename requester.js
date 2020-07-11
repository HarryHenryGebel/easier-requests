/**
 * @file provide the requester class
 * @author Harry Henry Gebel <hhgebel@gmail.com>
 * @copyright 2020 Harry Henry Gebel
 * @license MIT
 * @version 0.0.0
 * @module easier-requests
 * @since 0.0.0
 */
'use strict';

import axios from 'axios';

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
    this.cachedResponses = {};
    this.cachedErrors = {};

    // in flight request IDs
    this.inFlightRequests = {};
  }

  // TODO write function to generate guaranteed unique IDs

  /**
   * Retrieve a response based on it's ID
   * @since 0.0.0
   * @param {string} id - The ID passed into the HTTP request when it
   * was created
   * @return {Object} The response returned. Will be set to undefined
   * if the request failed.
   * @throws {RequestNotComplete} Thrown when a response is requested
   * from an in-flight request.
   * @throws {InvalidRequest} Thrown when an ID does not exist. Caused
   * by a request never being made or already having been
   * retrieved. Retrieved requests are deleted from the cache
   * to prevent a memory leak on long running apps.
   */
  response(id) {
    if (this.cachedResponses[id] === undefined)
      // do not delete until the error is retrieved
      return undefined;
    const response = this.cachedResponses[id];
    delete this.cachedErrors[id];
    delete this.cachedResponses[id];
    return response;
  }

  // TODO write function to retrieve error messages

  /**
   * perform an HTTP request and cache response
   * @async
   * @since 0.0.0
   * @param {string} url - URL of resource to be requested
   * @param {string} id - Unique ID used to refer to request and response
   * @throws {IDInUse} Thrown when a requested ID is already in use.
   */
  async httpGet(url, id) {
    // cache id with promise
    this.inFlightRequests[id] = axios.get(url)
    // on success, set error to undefined, on failure set response to
    // undefined
      .then(function (response) {
        this.cachedResponses[id] = response;
        this.cachedErrors[id] = undefined;
      })
      .catch(function (error) {
        this.cachedResponses[id] = undefined;
        this.cachedErrors[id] = error;
      });
    await this.inFlightRequests[id];

    // get rid of cached ID since we are no longer in flight
    delete this.inFlightRequests[id];
  }
}
const cache = new ResponseHolder();

// TODO create errors that the documentation falsely claims will be
// thrown on invalid requests IDs (and throw the errors).

//  LocalWords:  RequestNotComplete InvalidRequest IDInUse
