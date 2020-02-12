import axios from 'axios';
import {refreshOAuth2Tokens} from './refresh-grant';

jest.mock('axios');

describe('refreshOAuth2Tokens', () => {

  const config = () => ({
    tokenEndpoint: 'https://idam/oauth2/token',
    clientId: 'client-123',
    clientSecret: 'secret-123',
  });

  beforeEach(() => {
    axios.post.mockReset();
  });

  test('should exchange code for OAuth2 tokens', async () => {
    const tokensRes = {
      access_token: 'token-123',
      id_token: 'token-456',
      expires_in: 300,
    };
    axios.post.mockResolvedValue({data: tokensRes});

    const tokens = await refreshOAuth2Tokens(config())('refresh-123');

    expect(tokens).toEqual(tokensRes);

    const lastPost = axios.post.mock.calls[axios.post.mock.calls.length - 1];

    expect(lastPost[0]).toEqual('https://idam/oauth2/token');
    expect(lastPost[1].get('grant_type')).toEqual('refresh_token');
    expect(lastPost[1].get('refresh_token')).toEqual('refresh-123');
    expect(lastPost[2]).toEqual({
      headers: {
        authorization: 'Basic Y2xpZW50LTEyMzpzZWNyZXQtMTIz',
      }
    });
  });
});
