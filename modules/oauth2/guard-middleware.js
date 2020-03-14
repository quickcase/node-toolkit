import {defaultRolesExtractor, defaultScopesExtractor} from './oidc';
import {headerAccessTokenSupplier} from './oauth2';

const send401 = ({res}) => res.status(401).send();

const DEFAULT_CONFIG = Object.freeze({
  accessTokenSupplier: headerAccessTokenSupplier('Authorization'),
  rolesExtractor: defaultRolesExtractor,
  scopesExtractor: defaultScopesExtractor,
  onError: send401,
});

const withDefaults = (config) => Object.assign({}, DEFAULT_CONFIG, config);

/**
 * @callback Oauth2GuardErrorHandler
 * @param {{req, res, next, error}} error ExpressJS functions and errors
 */

/**
 * @typedef {object} Oauth2GuardConfig
 * @property {AccessTokenSupplier} accessTokenSupplier Function extracting the access token from an ExpressJS request
 * @property {JwtVerifier} jwtVerifier Function verifying the JWT access token
 * @property {Oauth2GuardErrorHandler} onError Function handling errors
 * @property {RolesExtractor} rolesExtractor Function extracting roles from user claims
 * @property {ScopesExtractor} scopesExtractor Function extracting scopes from access token claims
 * @property {UserInfoRetriever} userInfoRetriever Function retrieving the user claims from the OIDC provider
 */

/**
 * ExpressJS middleware mandating the presence of an Authorization header with a
 * valid access token and extracting user claims and granted authorities.
 *
 * @param {Oauth2GuardConfig} config Configuration for ExpressJS middleware
 * @return {ExpressMiddleware}
 */
export const oauth2Guard = (config) => {
  config = withDefaults(config);

  return async (req, res, next) => {
    const accessToken = config.accessTokenSupplier(req);

    if (!accessToken)
      return config.onError({req, res, next, error: 'Access token missing'});

    try {
      const claims = await config.jwtVerifier(accessToken);

      const scopes = config.scopesExtractor(claims);
      req.grantedAuthorities = scopes;

      if (scopes.includes('profile')) {
        req.userClaims = await config.userInfoRetriever(accessToken);
        req.grantedAuthorities = config.rolesExtractor(req.userClaims);
      }

    } catch (error) {
      return config.onError({req, res, next, error});
    }

    next();
  };
};
