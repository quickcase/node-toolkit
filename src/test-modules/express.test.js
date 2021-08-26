import {expectMiddleware, givenMiddleware} from './express';

describe('expectMiddleware', () => {
  test('should resolve with response when response expected', async () => {
    const middleware = (req, res) => res.status(201).json({foo: 'bar'});
    const res = await expectMiddleware(middleware, {}, true);
    expect(res).toEqual({
      status: 201,
      body: {foo: 'bar'},
    });
  });

  test('should reject with response when response not expected', async () => {
    const middleware = (req, res) => res.send();
    await expect(expectMiddleware(middleware, {}, false)).rejects.toEqual({status: 200});
  });

  test('should resolve with next when next expected', async () => {
    const middleware = (req, res, next) => next('error');
    const next = await expectMiddleware(middleware, {});
    expect(next).toEqual('error');
  });

  test('should reject with next when next not expected', async () => {
    const middleware = (req, res, next) => next('next-error');
    await expect(expectMiddleware(middleware, {}, true)).rejects.toEqual({
      error: 'next-error',
      message: 'Unexpected call to next()',
    });
  });

  test('should record cookies set on response', async () => {
    const middleware = (req, res) => res.cookie('cookie1', 'value1', {secure: true})
                                        .cookie('cookie2', 'value2', {httpOnly: true})
                                        .send();
    const res = await expectMiddleware(middleware, {}, true);
    expect(res).toEqual({
      status: 200,
      cookies: [
        {
          name: 'cookie1',
          value: 'value1',
          options: {secure: true},
        },
        {
          name: 'cookie2',
          value: 'value2',
          options: {httpOnly: true},
        },
      ],
    });
  });

  test('should record cookies cleared on response', async () => {
    const middleware = (req, res) => res.clearCookie('cookie1')
                                        .clearCookie('cookie2', {httpOnly: true})
                                        .send();
    const res = await expectMiddleware(middleware, {}, true);
    expect(res).toEqual({
      status: 200,
      clearCookies: [
        {
          name: 'cookie1',
          options: undefined,
        },
        {
          name: 'cookie2',
          options: {httpOnly: true},
        },
      ],
    });
  });
  
});

describe('givenMiddleware', () => {
  test('should resolve with response when response expected', async () => {
    const middleware = (req, res) => res.status(201).json({foo: 'bar'});
    const res = await givenMiddleware(middleware).when({}).expectResponse();
    expect(res).toEqual({
      status: 201,
      body: {foo: 'bar'},
    });
  });

  test('should reject with response when response not expected', async () => {
    const middleware = (req, res) => res.send();
    await expect(givenMiddleware(middleware).when({}).expectNext()).rejects.toEqual({status: 200});
  });

  test('should resolve with next when next expected', async () => {
    const middleware = (req, res, next) => next('error');
    const next = await givenMiddleware(middleware).when({}).expectNext();
    expect(next).toEqual('error');
  });

  test('should reject with next when next not expected', async () => {
    const middleware = (req, res, next) => next('next-error');
    await expect(givenMiddleware(middleware).when({}).expectResponse()).rejects.toEqual({
      error: 'next-error',
      message: 'Unexpected call to next()',
    });
  });
});
