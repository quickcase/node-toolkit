const DEFAULT_NAME = 'System';

const authentication = (accessToken, id, name, authorities, clientOnly, claims) => ({
  accessToken,
  id,
  name,
  authorities,
  clientOnly,
  claims,
});

const clientAuthentication = (accessToken, clientId, authorities) =>
  authentication(accessToken, clientId, DEFAULT_NAME, authorities, true, null);

const userAuthentication = (accessToken, subject, authorities, name, claims) =>
  authentication(accessToken, subject, name, authorities, false, claims);

export const oidcAuthenticationSupplier = (config) => async (accessToken) => {
  const {
    accessTokenVerifier,
    openidScope,
    userClaimsSupplier,
  } = config;

  const {clientId, scopes} = await accessTokenVerifier(accessToken);

  if (scopes.includes(openidScope)) {
    const claims = await userClaimsSupplier(accessToken);
    const {sub, name, roles} = claims;
    return userAuthentication(accessToken, sub, roles, name, claims);
  }

  return clientAuthentication(accessToken, clientId, scopes);
};
