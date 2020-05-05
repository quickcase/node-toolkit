/**
 * Decorator for an Express middleware which dynamically instantiates request-based
 * dependencies and underlying middleware upon processing of a request.
 * @param {object} dependencySuppliers Dictionary of named dependency suppliers.
 *  Each supplier will be invoked with the instance of the current Express request.
 *  Each dependency supplied will be provided to the middleware under the same name.
 * @param {function} middlewareSupplier Function that will be passed
 *  the initialised dependencies and return an initialised Express middleware.
 * @return {ExpressMiddleware} Express middleware function which will invoke the
 *  initialised middleware when called.
 */
export const middlewareFactory = (dependencySuppliers) => (middlewareSupplier) => (req, res, next) => {
  const dependencies = Object.entries(dependencySuppliers)
                             .reduce((acc, [key, factory]) => {
                               acc[key] = factory(req);
                               return acc;
                             }, {});
  middlewareSupplier(dependencies)(req, res, next);
};
