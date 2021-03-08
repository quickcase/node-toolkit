import {oauth2Guard} from './guard-middleware';

const USER_INFO = {app_roles: 'role1,role2'};

const newReq = (headers) => ({
  get: (key) => headers[key.toLowerCase()],
});

describe('oauth2Guard', () => {
  test('should reject with 401 when no authorization header', (done) => {
    const req = newReq({});
    const res = {
      status: (code) => {
        expect(code).toBe(401);
        return {send: () => done()};
      }
    };
    oauth2Guard()(req, res);
  });

  test('should reject with 401 when empty authorization header', (done) => {
    const req = newReq({authorization: ''});
    const res = {
      status: (code) => {
        expect(code).toBe(401);
        return {send: () => done()};
      }
    };
    oauth2Guard()(req, res);
  });

  test('should reject with 401 when malformed authorization header', (done) => {
    const req = newReq({authorization: 'Basic xxx'});
    const res = {
      status: (code) => {
        expect(code).toBe(401);
        return {send: () => done()};
      }
    };
    oauth2Guard()(req, res);
  });

  test('should reject with 401 when access token fails verification', (done) => {
    const req = newReq({authorization: 'Bearer invalidJwtToken'});
    const res = {
      status: (code) => {
        expect(code).toBe(401);
        return {send: () => done()};
      }
    };
    oauth2Guard({
      jwtVerifier: () => Promise.reject(),
    })(req, res);
  });

  test('should call next middleware when valid token', (done) => {
    const req = newReq({authorization: 'Bearer validJwtToken'});
    const res = {};
    oauth2Guard({
      jwtVerifier: () => Promise.resolve({}),
    })(req, res, done);
  });

  test('should retrieve user claims when scope claim contains `profile`', (done) => {
    const req = newReq({authorization: 'Bearer validJwtToken'});
    const res = {};
    const next = () => {
      expect(req.userClaims).toEqual(USER_INFO);
      done();
    };
    oauth2Guard({
      jwtVerifier: () => Promise.resolve({'scope': 'openid profile email'}),
      userInfoRetriever: () => Promise.resolve(USER_INFO),
    })(req, res, next);
  });

  test('should reject with 401 when user info cannot be retrieved', (done) => {
    const req = newReq({authorization: 'Bearer validJwtToken'});
    const res = {
      status: (code) => {
        expect(code).toBe(401);
        return {send: () => done()};
      }
    };
    oauth2Guard({
      jwtVerifier: () => Promise.resolve({'scope': 'openid profile email'}),
      userInfoRetriever: () => Promise.reject(),
    })(req, res);
  });

  test('should populate granted authorities for user with profile', (done) => {
    const req = newReq({authorization: 'Bearer validJwtToken'});
    const res = {};
    const next = () => {
      expect(req.grantedAuthorities).toEqual(['role1', 'role2']);
      done();
    };
    oauth2Guard({
      jwtVerifier: () => Promise.resolve({'scope': 'openid profile email'}),
      userInfoRetriever: () => Promise.resolve(USER_INFO),
    })(req, res, next);
  });

  test('should populate granted authorities for user with custom scope profile', (done) => {
    const req = newReq({authorization: 'Bearer validJwtToken'});
    const res = {};
    const next = () => {
      expect(req.grantedAuthorities).toEqual(['role1', 'role2']);
      done();
    };
    oauth2Guard({
      jwtVerifier: () => Promise.resolve({'scope': 'custom-openid'}),
      userInfoRetriever: () => Promise.resolve(USER_INFO),
      userInfoScope: 'custom-openid',
    })(req, res, next);
  });

  test('should populate granted authorities for user without profile', (done) => {
    const req = newReq({authorization: 'Bearer validJwtToken'});
    const res = {};
    const next = () => {
      expect(req.grantedAuthorities).toEqual(['data-store/scope1', 'data-store/scope2']);
      done();
    };
    oauth2Guard({
      jwtVerifier: () => Promise.resolve({'scope': 'data-store/scope1 data-store/scope2'}),
    })(req, res, next);
  });

  test('should populate access token', (done) => {
    const req = newReq({authorization: 'Bearer validJwtToken'});
    const res = {};
    const next = () => {
      expect(req.accessToken).toEqual('validJwtToken');
      done();
    };
    oauth2Guard({
      jwtVerifier: () => Promise.resolve({'scope': 'test'}),
    })(req, res, next);
  });
});
