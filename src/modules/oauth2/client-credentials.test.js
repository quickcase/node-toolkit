import axios from 'axios';
import {clientAccessTokenProvider} from './client-credentials';

jest.mock('axios');

describe('clientAccessTokenProvider', () => {

  const config = (cacheTtl) => ({
    cacheTtl,
    tokenEndpoint: 'https://idam/oauth2/token',
    clientId: 'client-123',
    clientSecret: 'secret-123',
  });

  beforeEach(() => {
    axios.post.mockReset();
  });

  test('should generate client access token', async () => {
      axios.post.mockResolvedValue({data: {access_token: 'token-123'}});

      const accessToken = await clientAccessTokenProvider(config(0))();

      expect(accessToken).toEqual('token-123');

      const lastPost = axios.post.mock.calls[axios.post.mock.calls.length - 1];

      expect(lastPost[0]).toEqual('https://idam/oauth2/token');
      expect(lastPost[1].get('grant_type')).toEqual('client_credentials');
      expect(lastPost[2]).toEqual({
        headers: {
          authorization: 'Basic Y2xpZW50LTEyMzpzZWNyZXQtMTIz',
        }
      });
  });

  test('should cache access token', async () => {
    // 500ms cache
    const provider = clientAccessTokenProvider(config(1));

    axios.post.mockResolvedValue({data: {access_token: 'token-123'}});

    await provider();

    await new Promise((resolve) => setTimeout(resolve));

    axios.post.mockResolvedValue({data: {access_token: 'token-456'}});

    const accessToken = await provider();

    expect(accessToken).toEqual('token-123');
  });

  test('should re-generate access token when cache expired', async () => {
    const provider = clientAccessTokenProvider(config(0));

    axios.post.mockResolvedValue({data: {access_token: 'token-123'}});

    await provider();

    axios.post.mockResolvedValue({data: {access_token: 'token-456'}});

    await new Promise((resolve) => setTimeout(resolve, 500));

    const accessToken = await provider();

    expect(accessToken).toEqual('token-456');
  });

  test('should cache by default when no ttl provided', async () => {
    const provider = clientAccessTokenProvider(config());

    axios.post.mockResolvedValue({data: {access_token: 'token-123'}});

    await provider();

    await new Promise((resolve) => setTimeout(resolve));

    axios.post.mockResolvedValue({data: {access_token: 'token-456'}});

    const accessToken = await provider();

    expect(accessToken).toEqual('token-123');
  });
});
