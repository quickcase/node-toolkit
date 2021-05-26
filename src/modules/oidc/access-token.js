export const simpleJwtAccessTokenParser = () => (claims) => {

  const mapClaim = (claim) => (map = (v) => v, defaultValue) =>
    Object.keys(claims).includes(claim) ? map(claims[claim]) : defaultValue;

  return ({
    clientId: mapClaim('sub')(),
    scopes: mapClaim('scope')((claim) => claim.split(' '), []),
  });
};

export const jwtAccessTokenVerifier = ({jwtVerifier, jwtAccessTokenParser}) => async (jwtAccessToken) => {
  const claims = await jwtVerifier(jwtAccessToken);
  return jwtAccessTokenParser(claims);
};
