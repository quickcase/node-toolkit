import {oidcAuthenticationSupplier} from './authentication';

describe('oidcAuthenticationSupplier', () => {
  test('should throw error when access token fails verification', async () => {
    const authSupplier = oidcAuthenticationSupplier({
      accessTokenVerifier: (token) => Promise.reject(Error(`error: ${token}`)),
    });

    await expect(authSupplier('invalid token')).rejects.toThrow('error: invalid token');
  });

  test('should return client authentication from scopes and client ID', async () => {
    const authSupplier = oidcAuthenticationSupplier({
      accessTokenVerifier: (token) => Promise.resolve({
        clientId: `client-${token}`,
        scopes: ['scope-1', 'scope-2'],
      }),
    });

    const auth = await authSupplier('validtoken');

    expect(auth).toEqual({
      accessToken: 'validtoken',
      id: 'client-validtoken',
      authorities: ['scope-1', 'scope-2'],
      name: 'System',
      clientOnly: true,
      claims: null,
    });
  });

  test('should throw when user claims cannot be retrieved', async () => {
    const authSupplier = oidcAuthenticationSupplier({
      accessTokenVerifier: (token) => Promise.resolve({
        clientId: `client-${token}`,
        scopes: ['openid', 'scope-2'],
      }),
      openidScope: 'openid',
      userClaimsSupplier: (token) => Promise.reject(Error(`error: no claims for ${token}`)),
    });

    await expect(authSupplier('validtoken')).rejects.toThrow('error: no claims for validtoken');
  });

  test('should throw when user claims cannot be retrieved', async () => {
    const authSupplier = oidcAuthenticationSupplier({
      accessTokenVerifier: (token) => Promise.resolve({
        clientId: `client-${token}`,
        scopes: ['openid', 'scope-2'],
      }),
      openidScope: 'openid',
      userClaimsSupplier: (token) => ({
        sub: 'user-123',
        name: `name-${token}`,
        roles: ['role-1', 'role-2'],
      }),
    });

    const auth = await authSupplier('validtoken');

    expect(auth).toEqual({
      accessToken: 'validtoken',
      id: 'user-123',
      authorities: ['role-1', 'role-2'],
      name: 'name-validtoken',
      clientOnly: false,
      claims: {
        sub: 'user-123',
        name: 'name-validtoken',
        roles: ['role-1', 'role-2'],
      },
    })
  });
});
