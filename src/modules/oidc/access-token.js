export const jwtAccessTokenVerifier = ({jwtVerifier, jwtAccessTokenParser}) => async (jwtAccessToken) => {
  const claims = await jwtVerifier(jwtAccessToken);
  return jwtAccessTokenParser(claims);
};
