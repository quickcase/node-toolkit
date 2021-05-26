import {simpleJwtAccessTokenParser, jwtAccessTokenVerifier} from './access-token';

describe('simpleJwtAccessTokenParser', () => {
  test('should return empty scopes array when no `scope` claim', async () => {
    const {scopes} = simpleJwtAccessTokenParser()({});

    expect(scopes).toEqual([]);
  });

  test('should extract and split scopes from `scope` claim', async () => {
    const {scopes} = simpleJwtAccessTokenParser()({scope: 'scope1 scope2'});

    expect(scopes).toEqual(['scope1', 'scope2']);
  });

  test('should default clientId to undefined', async () => {
    const {clientId} = simpleJwtAccessTokenParser()({});

    expect(clientId).toBeUndefined();
  });

  test('should extract clientId from `sub` claim', async () => {
    const {clientId} = simpleJwtAccessTokenParser()({sub: 'client-123'});

    expect(clientId).toEqual('client-123');
  });
});


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
