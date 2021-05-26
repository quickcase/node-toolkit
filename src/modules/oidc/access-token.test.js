import {jwtAccessTokenVerifier} from './access-token';

describe('jwtAccessTokenVerifier', () => {
  test('should throw error if token cannot be verified', async () => {
    const jwtVerifier = (token) => Promise.reject(Error(`token not valid: ${token}`));
    const jwtAccessTokenParser = () => [];
    const verifier = jwtAccessTokenVerifier({jwtVerifier, jwtAccessTokenParser});

    await expect(verifier('invalid-token')).rejects.toThrow('token not valid: invalid-token');
  });

  test('should return parsed access token claims', async () => {
    const jwtVerifier = (token) => Promise.resolve({
      sub: `client-${token}`,
      scope: 'scope1 scope2',
    });
    const jwtAccessTokenParser = (claims) => ({clientId: claims.sub, scopes: claims.scope.split(' ')});
    const verifier = jwtAccessTokenVerifier({jwtVerifier, jwtAccessTokenParser});

    const tokenClaims = await verifier('validtoken');

    expect(tokenClaims).toEqual({
      clientId: 'client-validtoken',
      scopes: ['scope1', 'scope2'],
    });
  });
});
