import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import {
  cachedJwtKeySupplier,
  defaultJwtKeySupplier,
  defaultJwtVerifier
} from './jwt';

jest.mock('jwks-rsa');

describe('cachedJwtKeySupplier', () => {
  test('should use decorated supplier', async () => {
    const supplier = () => Promise.resolve('secret');
    const key = await cachedJwtKeySupplier()(supplier)({kid: '123'});

    expect(key).toBe('secret');
  });

  test('should use cache for same kid', async () => {
    let i = 1;
    const supplier = ({kid}) => Promise.resolve(`${kid}-secret-${i++}`);
    const cachedSupplier = cachedJwtKeySupplier()(supplier);

    const key1 = await cachedSupplier({kid: '123'});
    const key2 = await cachedSupplier({kid: '123'});

    expect(key2).toBe(key1);
  });

  test('should not use cache for different kid', async () => {
    let i = 1;
    const supplier = ({kid}) => Promise.resolve(`${kid}-secret-${i++}`);
    const cachedSupplier = cachedJwtKeySupplier()(supplier);

    const key1 = await cachedSupplier({kid: '123'});
    const key2 = await cachedSupplier({kid: '456'});

    expect(key2).toBe('456-secret-2');
  });

  test('should invalidate cache after ttl', async () => {
    let i = 1;
    const supplier = ({kid}) => Promise.resolve(`${kid}-secret-${i++}`);
    const cachedSupplier = cachedJwtKeySupplier({ttlMs: 2})(supplier);

    const key1 = await cachedSupplier({kid: '123'});

    await new Promise((resolve) => setTimeout(resolve, 5));

    const key2 = await cachedSupplier({kid: '123'});

    expect(key2).toBe('123-secret-2');
  });
});

describe('defaultJwtKeySupplier', () => {
  test('should resolve with public key retrieved from JWKS', async () => {
    const jwksUri = 'http://idam/.well-known/jwks.json';
    jwksClient.mockReturnValue({
      getSigningKey: (kid, cb) => cb(null, {publicKey: `${kid}-key`}),
    });
    const key = await defaultJwtKeySupplier({jwksUri})({kid: '123'});

    expect(key).toBe('123-key');
  });

  test('should resolve with public RSA key retrieved from JWKS', async () => {
    const jwksUri = 'http://idam/.well-known/jwks.json';
    jwksClient.mockReturnValue({
      getSigningKey: (kid, cb) => cb(null, {rsaPublicKey: `${kid}-key`}),
    });
    const key = await defaultJwtKeySupplier({jwksUri})({kid: '123'});

    expect(key).toBe('123-key');
  });

  test('should reject when key cannot retrieved from JWKS', async () => {
    const jwksUri = 'http://idam/.well-known/jwks.json';
    jwksClient.mockReturnValue({
      getSigningKey: (kid, cb) => cb(`${kid}-error`, null),
    });
    await expect(defaultJwtKeySupplier({jwksUri})({kid: '123'})).rejects.toEqual('123-error');
  });
});

describe('defaultJwtVerifier', () => {
  const SECRET_KEY = 'thisIsTheSecret';
  const newJwt = (claims) => jwt.sign(claims || {}, SECRET_KEY, {expiresIn: 5});

  test('should reject when key cannot be supplied', async () => {
    const jwtKeySupplier = () => Promise.reject();

    await expect(defaultJwtVerifier(jwtKeySupplier)(newJwt())).rejects.toMatchObject({name: 'JsonWebTokenError'});
  });

  test('should reject when malformed access token', async () => {
    const jwtKeySupplier = () => Promise.resolve(SECRET_KEY);

    await expect(defaultJwtVerifier(jwtKeySupplier)('malformedAccessToken')).rejects.toMatchObject({name: 'JsonWebTokenError'});
  });

  test('should reject when access token has incorrect signature', async () => {
    const jwtKeySupplier = () => Promise.resolve(SECRET_KEY);
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Qi-csvNg8qhEQVzraV0_iNHRsLNMHA388gJ4NrAqVfk';

    await expect(defaultJwtVerifier(jwtKeySupplier)(token)).rejects.toMatchObject({name: 'JsonWebTokenError'});
  });

  test('should reject when access token is expired', async () => {
    const jwtKeySupplier = () => Promise.resolve(SECRET_KEY);
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3QifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MjAwMDAwMDB9.5wmJTbTlQgD1QrzI9FBaLfmBQ1ioFqeAnoZpS0K_wHU';

    await expect(defaultJwtVerifier(jwtKeySupplier)(token)).rejects.toMatchObject({name: 'TokenExpiredError'});
  });

  test('should resolve with payload when valid token', async () => {
    const jwtKeySupplier = () => Promise.resolve(SECRET_KEY);
    const payload = {sub: '123'};
    await expect(defaultJwtVerifier(jwtKeySupplier)(newJwt(payload))).resolves.toMatchObject(payload);
  });
});
