export const oidcResourceServerGuard = (config) => {
  const {
    accessTokenSupplier,
    authenticationSupplier,
    onError,
  } = config;

  return async (req, res, next) => {
    const accessToken = accessTokenSupplier(req);

    if (!accessToken) {
      return onError({req, res, next, error: 'Access token missing'});
    }

    try {
      const authentication = await authenticationSupplier(accessToken);
      req.authentication = authentication;
    } catch (error) {
      return onError({req, res, next, error});
    }

    return next();
  };
};
