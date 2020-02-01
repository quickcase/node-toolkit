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

  test('should securely post resource', async () => {
    const body = {foo: 'bar'};
    const expectedResp = {status: 201};
    axios.post.mockResolvedValue(expectedResp);

    const resp = await httpClient(baseUrl)(tokenProviderStub).post('/path/to/resource', body);

    expect(resp).toEqual(expectedResp);
    expect(axios.post).toHaveBeenCalledWith('http://data-store:4452/path/to/resource', body,{headers: {Authorization: 'Bearer access-token-123'}});
  });
});
