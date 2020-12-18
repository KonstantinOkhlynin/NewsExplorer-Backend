/* eslint-disable linebreak-style */
class NotForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

module.exports = NotForbiddenError;
