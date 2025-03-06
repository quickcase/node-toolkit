import axios from 'axios';
import {httpClient} from './http-client';

jest.mock('axios');

describe('httpClient', () => {
  const baseUrl = 'http://data-store:4452';
  const tokenProviderStub = () => Promise.resolve('access-token-123');

  test('should securely get resource', async () => {
    const expectedResp = {data: {foo: 'bar'}};
    axios.get.mockResolvedValue(expectedResp);

    const resp = await httpClient(baseUrl)(tokenProviderStub).get('/path/to/resource');

    expect(resp).toEqual(expectedResp);
    expect(axios.get).toHaveBeenCalledWith('http://data-store:4452/path/to/resource', {headers: {Authorization: 'Bearer access-token-123'}});
  });

  test('should get resource with request parameters', async () => {
    const expectedResp = {data: {foo: 'bar'}};
    axios.get.mockResolvedValue(expectedResp);

    const resp = await httpClient(baseUrl)(tokenProviderStub).get('/path/to/resource', {['with-links']: 'true'});

    expect(resp).toEqual(expectedResp);
    expect(axios.get).toHaveBeenCalledWith('http://data-store:4452/path/to/resource',
      {
        headers: {Authorization: 'Bearer access-token-123'},
        params: {['with-links']: 'true'},
      }
    );
  });

  test('should securely post resource', async () => {
    const body = {foo: 'bar'};
    const expectedResp = {status: 201};
    axios.post.mockResolvedValue(expectedResp);

    const resp = await httpClient(baseUrl)(tokenProviderStub).post('/path/to/resource', body);

    expect(resp).toEqual(expectedResp);
    expect(axios.post).toHaveBeenCalledWith('http://data-store:4452/path/to/resource', body, {headers: {Authorization: 'Bearer access-token-123'}});
  });

  test('should post resource with request parameters', async () => {
    const body = {foo: 'bar'};
    const expectedResp = {status: 201};
    axios.post.mockResolvedValue(expectedResp);

    const resp = await httpClient(baseUrl)(tokenProviderStub).post('/path/to/resource', body, {['computed-fields']: ['computedField1']});

    expect(resp).toEqual(expectedResp);
    expect(axios.post).toHaveBeenCalledWith('http://data-store:4452/path/to/resource',
      body,
      {
        headers: {Authorization: 'Bearer access-token-123'},
        params: {['computed-fields']: ['computedField1']},
      }
    );
  });

  test('should securely put resource', async () => {
    const body = {foo: 'bar'};
    const expectedResp = {status: 200};
    axios.put.mockResolvedValue(expectedResp);

    const resp = await httpClient(baseUrl)(tokenProviderStub).put('/path/to/resource', body);

    expect(resp).toEqual(expectedResp);
    expect(axios.put).toHaveBeenCalledWith('http://data-store:4452/path/to/resource', body, {headers: {Authorization: 'Bearer access-token-123'}});
  });

  test('should put resource with request parameters', async () => {
    const body = {foo: 'bar'};
    const expectedResp = {status: 200};
    axios.put.mockResolvedValue(expectedResp);

    const resp = await httpClient(baseUrl)(tokenProviderStub).put('/path/to/resource', body, {filter: 'test'});

    expect(resp).toEqual(expectedResp);
    expect(axios.put).toHaveBeenCalledWith('http://data-store:4452/path/to/resource',
      body,
      {
        headers: {Authorization: 'Bearer access-token-123'},
        params: {filter: 'test'},
      }
    );
  });

  test('should accept custom axios instance', async () => {
    const customAxios = {
      get: jest.fn().mockResolvedValue({status: 200}),
      post: jest.fn().mockResolvedValue({status: 201}),
      put: jest.fn().mockResolvedValue({status: 202}),
    };

    const customClient = httpClient(baseUrl, customAxios)(tokenProviderStub);

    const [getRes, postRes, putRes] = await Promise.all([
      customClient.get('/path/to/get'),
      customClient.post('/path/to/post'),
      customClient.put('/path/to/put'),
    ]);

    expect(getRes).toEqual({status: 200});
    expect(postRes).toEqual({status: 201});
    expect(putRes).toEqual({status: 202});
  });
});
