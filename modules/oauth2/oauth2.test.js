import {cookieAccessTokenSupplier, headerAccessTokenSupplier} from './oauth2';

describe('cookieAccessTokenSupplier', () => {
  test('should extract access token from default cookie', () => {
    const token = cookieAccessTokenSupplier()({cookies: {'access_token': 'token-123'}});

    expect(token).toBe('token-123');
  });

  test('should extract access token from custom cookie', () => {
    const token = cookieAccessTokenSupplier('other')({cookies: {'other': 'token-123'}});

    expect(token).toBe('token-123');
  });

  test('should return undefined when cookie not found', () => {
    const token = cookieAccessTokenSupplier('other')({cookies: {'access_token': 'token-123'}});

    expect(token).toBeUndefined();
  });
});

describe('headerAccessTokenSupplier', () => {
  test('should extract access token from default header', () => {
    const req = {
      get: (header) => ({
        'authorization': 'Bearer token-123',
      })[header.toLowerCase()],
    };
    const token = headerAccessTokenSupplier()(req);

    expect(token).toBe('token-123');
  });

  test('should extract access token from custom header', () => {
    const req = {
      get: (header) => ({
        'other': 'Bearer token-123',
      })[header.toLowerCase()],
    };
    const token = headerAccessTokenSupplier('other')(req);

    expect(token).toBe('token-123');
  });

  test('should return undefined when header not found', () => {
    const req = {
      get: (header) => ({
        'authorization': 'Bearer token-123',
      })[header.toLowerCase()],
    };
    const token = headerAccessTokenSupplier('other')(req);

    expect(token).toBeUndefined();
  });

  test('should return undefined when header malformed', () => {
    const req = {
      get: (header) => ({
        'authorization': 'token-123',
      })[header.toLowerCase()],
    };
    const token = headerAccessTokenSupplier()(req);

    expect(token).toBeUndefined();
  });
});
