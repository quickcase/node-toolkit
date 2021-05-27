import axios from 'axios';
import {
  claimNamesProvider,
  userInfoExtractor,
  userInfoRetriever,
} from './user-info';

jest.mock('axios');

describe('claimNamesProvider', () => {
  test('should provide non-prefixed claim names', () => {
    const claimNames = claimNamesProvider({
      prefix: undefined,
      names: {
        sub: 'custom-sub',
        name: 'custom-name',
        email: 'custom-email',
        roles: 'app.quickcase.claims/roles',
        organisations: 'app.quickcase.claims/organisations',
      },
    })();

    expect(claimNames).toEqual({
      sub: 'custom-sub',
      name: 'custom-name',
      email: 'custom-email',
      roles: 'app.quickcase.claims/roles',
      organisations: 'app.quickcase.claims/organisations',
    });
  });

  test('should provide prefixed claim names', () => {
    const claimNames = claimNamesProvider({
      prefix: 'a-prefix:',
      names: {
        sub: 'custom-sub',
        name: 'custom-name',
        email: 'custom-email',
        roles: 'app.quickcase.claims/roles',
        organisations: 'app.quickcase.claims/organisations',
      },
    })();

    expect(claimNames).toEqual({
      sub: 'custom-sub',
      name: 'custom-name',
      email: 'custom-email',
      roles: 'a-prefix:app.quickcase.claims/roles',
      organisations: 'a-prefix:app.quickcase.claims/organisations',
    });
  });
});

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

describe('userInfoExtractor', () => {
  test('should parse user info claims from provided names', async () => {
    const claimNames = ({
      sub: 'sub',
      name: 'name',
      email: 'email',
      roles: 'app.quickcase.claims/roles',
      organisations: 'app.quickcase.claims/organisations',
    });

    const claims = userInfoExtractor(() => claimNames)({
      'sub': 'user-123',
      'name': 'Test User',
      'email': 'test-user@quickcase.app',
      'app.quickcase.claims/roles': 'role1,role2',
      'app.quickcase.claims/organisations': '{"ORG1": {"access": "GROUP"}}',
    });

    expect(claims).toEqual({
      sub: 'user-123',
      name: 'Test User',
      email: 'test-user@quickcase.app',
      roles: ['role1', 'role2'],
      organisations: {
        'ORG1': {
          'access': 'GROUP',
        }
      }
    });
  });

  test('should default value when provided names do not match', async () => {
    const claimNames = ({
      sub: 'not/sub',
      name: 'not/name',
      email: 'not/email',
      roles: 'not/app.quickcase.claims/roles',
      organisations: 'not/app.quickcase.claims/organisations',
    });

    const claims = userInfoExtractor(() => claimNames)({
      'sub': 'user-123',
      'name': 'Test User',
      'email': 'test-user@quickcase.app',
      'app.quickcase.claims/roles': 'role1,role2',
      'app.quickcase.claims/organisations': '{"ORG1": {"access": "GROUP"}}',
    });

    expect(claims).toEqual({
      sub: undefined,
      name: undefined,
      email: undefined,
      roles: [],
      organisations: {}
    });
  });
});
