import axios from 'axios';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import {
  quickcaseAuthenticationSupplier,
  quickcaseJwtVerifier,
  quickcaseResourceServerGuard,
} from './quickcase-config';
import {givenMiddleware} from '../../test-modules';

jest.mock('axios');
jest.mock('jwks-rsa');

describe('quickcaseJwtVerifier', () => {
  test('should validate config', () => {
    expect(() => quickcaseJwtVerifier({}))
      .toThrow(`OIDC configuration property 'quickcase.oidc.jwk-set-uri' is not of a type(s) string`);
  });
});

describe('quickcaseAuthenticationSupplier', () => {
  test('should validate config', () => {
    expect(() => quickcaseAuthenticationSupplier({}))
      .toThrow(`OIDC configuration property 'quickcase.oidc.jwk-set-uri' is not of a type(s) string`);
  });
});

describe('quickcaseResourceServerGuard', () => {
  const KEY_ID = 'key-123';
  const SECRET_KEY = 'thisIsTheSecret';

  const newJwt = (claims = {}, options = {}) =>
    jwt.sign(claims, `${KEY_ID}-${SECRET_KEY}`, Object.assign({expiresIn: 5}, options));

  test('should fail when configuration missing required prop', () => {
    expect(() => quickcaseResourceServerGuard({}))
      .toThrow(`OIDC configuration property 'quickcase.oidc.jwk-set-uri' is not of a type(s) string`);
  });

  test('should fail when configuration blanking required default', () => {
    expect(() => quickcaseResourceServerGuard({
      'jwk-set-uri': 'https://idam/jwks',
      'user-info-uri': 'https://idam/oidc/userInfo',
      claims: {
        names: {
          roles: '',
        },
      },
    })).toThrow(`OIDC configuration property 'quickcase.oidc.claims.names.roles' does not meet minimum length of 1`);
  });

  test('should provide a fully configured resource server guard middleware', async () => {
    const oidcConfig = {
      'jwk-set-uri': 'https://idam/jwks',
      'user-info-uri': 'https://idam/oidc/userInfo',
      claims: {
        prefix: 'qc:',
        names: {
          roles: 'claims/roles',
          organisations: 'claims/organisations',
        },
      },
    };

    axios.get.mockImplementation((url) => ({
      [oidcConfig['jwk-set-uri']]: Promise.resolve({data: {}}),
      [oidcConfig['user-info-uri']]: Promise.resolve({data: {
        'sub': 'jdoe-123',
        'name': 'John Doe',
        'email': 'john.doe@quickcase.app',
        'qc:claims/roles': 'roleA,roleB',
        'qc:claims/organisations': '{"OrgA": {"access": "organisation"}}',
      }}),
    })[url]);

    jwksClient.mockReturnValue({
      getSigningKey: (kid, cb) => cb(null, {rsaPublicKey: `${kid}-${SECRET_KEY}`}),
    });

    const token = newJwt({
      'sub': 'jdoe-123',
      'scope': 'openid profile',
    }, {
      keyid: KEY_ID,
    });

    const req = {
      get: (header) => ({
        'authorization': `Bearer ${token}`,
      })[header.toLowerCase()],
    };

    const guard = quickcaseResourceServerGuard(oidcConfig);

    await givenMiddleware(guard).when(req).expectNext();

    expect(req.authentication).toEqual({
      accessToken: token,
      authorities: ['roleA', 'roleB'],
      clientOnly: false,
      id: 'jdoe-123',
      name: 'John Doe',
      claims: {
        sub: 'jdoe-123',
        name: 'John Doe',
        email: 'john.doe@quickcase.app',
        roles: ['roleA', 'roleB'],
        organisations: {
          'OrgA': {
            'access': 'organisation'
          },
        },
      }
    });
  });
});
