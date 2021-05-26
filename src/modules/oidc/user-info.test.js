import axios from 'axios';
import {
  userInfoRetriever,
} from './user-info';

jest.mock('axios');

describe('userInfoRetriever', () => {
  test('should fetch user info', async () => {
    const userInfoUri = 'https://idam/oidc/userInfo';
    const accessToken = 'access-token-123';
    const expectedResp = {data: {sub: '123'}};

    axios.get.mockResolvedValue(expectedResp);

    const resp = await userInfoRetriever({userInfoUri})(accessToken);

    expect(resp).toEqual(expectedResp.data);
    expect(axios.get).toHaveBeenCalledWith(userInfoUri, {headers: {Authorization: `Bearer ${accessToken}`}});
  });
});
