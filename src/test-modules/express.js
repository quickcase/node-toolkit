/**
 * Asynchronous function encapsulating the execution of an Express middleware for test purpose.
 * @param {function} middleware Express middleware function taking 3 parameters: req, res, next
 * @param {object} req Express request object
 * @param {boolean} expectResponse Whether a response is expected, defaults to
 *  `false` which implies a call to next is expected instead
 * @return Promise resolved or rejected depending on whether a response or next was expected
 */
export const expectMiddleware = (middleware, req, expectResponse = false) => new Promise((resolve, reject) => {
  const resolveResponse = expectResponse ? resolve : reject;
  const next = expectResponse ? (error) => reject({
    message: 'Unexpected call to next()',
    error,
  }) : resolve;

  let response = {status: 200};

  const res = {};
  res.cookie = (name, value, options) => (response.cookies = [...(response.cookies || []), {name, value, options}], res);
  res.clearCookie = (name, options) => (response.clearCookies = [...(response.clearCookies || []), {name, options}], res);
  res.status = (code) => (response.status = code, res);
  res.json = (body) => (response.body = body, resolveResponse(response));
  res.send = () => resolveResponse(response);

  middleware(req, res, next);
});

/**
 * Syntactic sugar over {@link expectMiddleware} to provide arguments in a
 * given/when/expect fashion.
 * @param {function} middleware Express middleware function acception 3 parameters: req, res, next
 * @return {object} Object with `when` property containing function {@link whenMiddleware}
 */
export const givenMiddleware = (middleware) => ({when: whenMiddleware(middleware)});

/**
 * Syntactic sugar over {@link expectMiddleware} to provide arguments in a
 * when/expect fashion.
 * @param {function} middleware Express middleware function acception 3 parameters: req, res, next
 * @param {object} req Express request object
 * @return {object} Object with `expectResponse` and `expectNext` functions, both executing {@link expectMiddleware}
 */
export const whenMiddleware = (middleware) => (req) => ({
  expectResponse: () => expectMiddleware(middleware, req, true),
  expectNext: () => expectMiddleware(middleware, req, false),
});
