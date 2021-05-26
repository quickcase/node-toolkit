import {oidcError401} from './error-handlers';

describe('oidcError401', () => {
  test('should reply with 401 response', () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    oidcError401({res});

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalled();
  });
});
