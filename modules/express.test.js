import {middlewareFactory} from './express';

describe('middlewareFactory', () => {
  const ACCESS_TOKEN = 'ey123';
  const ROLES = ['role1', 'role2'];

  test('should create middleware with initialised dependencies', (done) => {
    const middleware = ({tokenSupplier, roles}) => (req, res, next) => {
      expect(tokenSupplier()).toEqual(ACCESS_TOKEN);
      expect(roles).toEqual(ROLES);
      done();
    };
    const req = {
      accessToken: ACCESS_TOKEN,
      roles: ROLES,
    };

    middlewareFactory({
      tokenSupplier: (req) => () => req.accessToken,
      roles: (req) => req.roles,
    })(middleware)(req);
  });
});
