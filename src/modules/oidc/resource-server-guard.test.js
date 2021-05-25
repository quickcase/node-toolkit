import {givenMiddleware} from '../../test-modules';
import {oidcResourceServerGuard} from './resource-server-guard';

const newReq = (headers) => ({
  get: (key) => headers[key.toLowerCase()],
});

describe('oidcResourceServerGuard', () => {
  test('should reject with error callback when no access token', async () => {
    const guard = oidcResourceServerGuard({
      accessTokenSupplier: (req) => null,
      onError: (e) => Promise.resolve(e),
    });

    const req = newReq({});
    const res = {};
    const next = () => {};

    const {error} = await guard(req, res, next);

    expect(error).toBe('Access token missing');
  });

  test('should reject with error callback when authentication could not be supplied', async () => {
    const guard = oidcResourceServerGuard({
      accessTokenSupplier: (req) => req.get('Authorization'),
      authenticationSupplier: (token) => Promise.reject(`error: no auth for ${token}`),
      onError: (e) => Promise.resolve(e),
    });

    const req = newReq({
      'authorization': 'access-token',
    });
    const res = {};
    const next = () => {};

    const {error} = await guard(req, res, next);

    expect(error).toBe('error: no auth for access-token');
  });

  test('should add authentication details to request', async () => {
    const guard = oidcResourceServerGuard({
      accessTokenSupplier: (req) => req.get('Authorization'),
      authenticationSupplier: (token) => Promise.resolve({
        accessToken: token,
        id: 'user-123',
      }),
      onError: (e) => Promise.reject(e),
    });

    const req = newReq({
      'authorization': 'access-token',
    });
    const res = {};
    const next = () => Promise.resolve();

    await guard(req, res, next);

    expect(req.authentication).toEqual({
      accessToken: 'access-token',
      id: 'user-123',
    });
  });
});
