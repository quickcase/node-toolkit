import {validate} from 'jsonschema';
import {camelConfig, mergeConfig} from '../config';
import {
  cachedJwtKeySupplier,
  defaultJwtKeySupplier,
  defaultJwtVerifier,
  headerAccessTokenSupplier,
} from '../oauth2';
import {
  claimNamesProvider,
  jwtAccessTokenVerifier,
  oidcAuthenticationSupplier,
  oidcResourceServerGuard,
  oidcError401,
  simpleJwtAccessTokenParser,
  userClaimsSupplier,
  userInfoExtractor,
  userInfoRetriever,
} from './';

const CONFIG_SCHEMA = {
  type: 'object',
  properties: {
    'jwk-set-uri': {type: 'string', format: 'uri'},
    'user-info-uri': {type: 'string', format: 'uri'},
    'openid-scope': {type: 'string', minLength: 1},
    'claims': {
      type: 'object',
      properties: {
        'prefix': {type: 'string', minLength: 0},
        'names': {
          type: 'object',
          properties: {
            'sub': {type: 'string', minLength: 1},
            'name': {type: 'string', minLength: 1},
            'email': {type: 'string', minLength: 1},
            'roles': {type: 'string', minLength: 1},
            'organisations': {type: 'string', minLength: 1},
          },
          required: ['sub', 'name', 'email', 'roles', 'organisations'],
        },
      },
      required: ['prefix', 'names'],
    },
  },
  required: ['jwk-set-uri', 'user-info-uri', 'openid-scope', 'claims'],
};

const OIDC_DEFAULTS = {
  'jwk-set-uri': null,
  'user-info-uri': null,
  'openid-scope': 'openid',
  claims: {
    prefix: '',
    names: {
      sub: 'sub',
      name: 'name',
      email: 'email',
      roles: 'app.quickcase.claims/roles',
      organisations: 'app.quickcase.claims/organisations',
    },
  },
};

const withOidcDefaults = mergeConfig(OIDC_DEFAULTS);

const sanitiseConfig = (config) => {
  const defaultedConfig = withOidcDefaults(config);

  const validationResult = validate(defaultedConfig, CONFIG_SCHEMA);

  if (!validationResult.valid) {
    const error = validationResult.errors[0];
    const prefixedProperty = error.property.replace(/^instance/, 'quickcase.oidc');
    error.message = `OIDC configuration property '${prefixedProperty}' ${error.message}`
    throw error;
  }

  return camelConfig(defaultedConfig);
};

export const quickcaseJwtVerifier = (config) => _quickcaseJwtVerifier(sanitiseConfig(config));

const _quickcaseJwtVerifier = (oidcConfig) => {
  const jwtKeySupplier = defaultJwtKeySupplier({jwksUri: oidcConfig.jwkSetUri});
  const cacheConfig = {ttlMs: 5 * 60 * 1000} // 5 minutes
  return defaultJwtVerifier(cachedJwtKeySupplier(cacheConfig)(jwtKeySupplier));
};

export const quickcaseAuthenticationSupplier = (config) => _quickcaseAuthenticationSupplier(sanitiseConfig(config));

const _quickcaseAuthenticationSupplier = (oidcConfig) => oidcAuthenticationSupplier({
  accessTokenVerifier: jwtAccessTokenVerifier({
    jwtVerifier: _quickcaseJwtVerifier(oidcConfig),
    jwtAccessTokenParser: simpleJwtAccessTokenParser(),
  }),
  openidScope: oidcConfig.openidScope,
  userClaimsSupplier: userClaimsSupplier({
    userInfoRetriever: userInfoRetriever({userInfoUri: oidcConfig.userInfoUri}),
    userInfoExtractor: userInfoExtractor(claimNamesProvider(oidcConfig.claims)),
  }),
});

export const quickcaseResourceServerGuard = (config) => _quickcaseResourceServerGuard(sanitiseConfig(config));

const _quickcaseResourceServerGuard = (oidcConfig) => oidcResourceServerGuard({
  accessTokenSupplier: headerAccessTokenSupplier('Authorization'),
  authenticationSupplier: _quickcaseAuthenticationSupplier(oidcConfig),
  onError: oidcError401,
});
