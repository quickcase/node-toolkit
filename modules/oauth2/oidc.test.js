import axios from 'axios';
import {
  defaultRolesExtractor,
  defaultScopesExtractor,
  defaultUserInfoRetriever,
} from './oidc';

jest.mock('axios');

describe('defaultRolesExtractor', () => {
  test('should return empty array when no roles claim', () => {
    const roles = defaultRolesExtractor({});
    expect(roles).toEqual([]);
  });

  test('should return empty array when empty roles claim', () => {
    const roles = defaultRolesExtractor({
      'app_roles': '',
    });
    expect(roles).toEqual([]);
  });

  test('should return roles as array', () => {
    const roles = defaultRolesExtractor({
      'app_roles': 'role1,role2,role3',
    });
    expect(roles).toEqual(['role1', 'role2', 'role3']);
  });
});

describe('defaultScopesExtractor', () => {
  test('should return empty array when no scope claim', () => {
    const scopes = defaultScopesExtractor({});
    expect(scopes).toEqual([]);
  });

  test('should return empty array when empty scope claim', () => {
    const scopes = defaultScopesExtractor({
      'scope': '',
    });
    expect(scopes).toEqual([]);
  });

  test('should return scopes as array', () => {
    const scopes = defaultScopesExtractor({
      'scope': 'scope1 scope2 scope3',
    });
    expect(scopes).toEqual(['scope1', 'scope2', 'scope3']);
  });
});

describe('defaultUserInfoRetriever', () => {
  test('should fetch user info', async () => {
    const userInfoUri = 'https://idam/oidc/userInfo';
    const accessToken = 'access-token-123';
    const expectedResp = {data: {sub: '123'}};
    axios.get.mockResolvedValue(expectedResp);

    const resp = await defaultUserInfoRetriever({userInfoUri})(accessToken);

    expect(resp).toEqual(expectedResp.data);
    expect(axios.get).toHaveBeenCalledWith(userInfoUri, {headers: {Authorization: `Bearer ${accessToken}`}});
  });
});
