/**
 * @file Project JavaScript file
 * @author Harry Henry Gebel <hhgebel@gmail.com>
 * @copyright 2020 Harry Henry Gebel
 * @license MIT
 * @version 0.0.0
 * @module easier-requests
 */
'use strict';

class ResponseHolder {
  constructor() {
    // holds responses awaiting retrieval
    this.cachedResponses = {};
    this.errors = {};
  }

  // retrieve a response from cache
  response(id) {
    const response = this.cachedResponses[id];
    delete this.cachedResponses[id];
    return response;
  }

  // perform an HTTP GET and cache the response
  async httpGet(url, id) {
    await axios.get(url)
      .then(response => this.cachedResponses[id] = response)
      .catch(function (error) {
        this.cachedResponses[id] = undefined;
        this.errors[id] = error;
      });
  }
}
const cache = new ResponseHolder();
