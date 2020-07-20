/**
 * @file Provide the error classes for easier-requests
 * @author Harry Henry Gebel <hhgebel@gmail.com>
 * @copyright 2020 Harry Henry Gebel
 * @license MIT
 * @version 0.0.3
 * @module error
 * @since 0.0.1
 */
'use strict';

/**
 * Error thrown when an attempt is made to create a request using an
 * existing ID
 * @since 0.0.1
 */
export class IDInUseError extends Error {
  /**
   * Create an IDInUseError
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message);
    this.name = "IDInUseError";
  }
}

/**
 * Error thrown when an attempt is made to access the response or
 * error from a request that has already been retrieved or that was
 * never created.
 * @since 0.0.1
 */
export class InvalidRequestError extends Error {
  /**
   * Create an InvalidRequestError
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message);
    this.name = "InvalidRequestError";
  }
}

/**
 * Error thrown when an attempt is made to access the response or
 * error from a request that is still in-flight
 * @since 0.0.1
 */
export class RequestNotCompleteError extends Error {
  /**
   * Create a RequestNotCompleteError
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message);
    this.name = "RequestNotCompleteError";
  }
}

/**
 * Error thrown when there is not an even number of parameter
 * arguments passed to a function.
 * @since 0.0.3
 */
export class UnbalancedParametersError extends Error {
  /**
   * Create an InvalidRequestError
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message);
    this.name = "UnbalancedParametersError";
  }
}

//  LocalWords:  IDInUseError RequestNotCompleteError
//  LocalWords:  InvalidRequestError UnbalancedParametersError
