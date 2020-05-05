import {
  grantGroupAccess,
  grantUserAccess,
  revokeGroupAccess,
  revokeUserAccess,
} from './case-access';

describe('grantGroupAccess', () => {
  test('should grant access to group with given case roles', async () => {
    const caseId = '1234123412341238';
    const groupId = 'group-123';
    const httpStub = {
      put: jest.fn(() => Promise.resolve({status: 204})),
    };

    await grantGroupAccess(httpStub)(caseId)(groupId)('[CREATOR]', '[OWNER]');

    expect(httpStub.put).toHaveBeenCalledWith(`/cases/${caseId}/groups/${groupId}`, {
      case_roles: [
        '[CREATOR]',
        '[OWNER]',
      ],
    });
  });
});

describe('grantUserAccess', () => {
  test('should grant access to user with given case roles', async () => {
    const caseId = '1234123412341238';
    const userId = 'user-123';
    const httpStub = {
      put: jest.fn(() => Promise.resolve({status: 204})),
    };

    await grantUserAccess(httpStub)(caseId)(userId)('[CREATOR]', '[OWNER]');

    expect(httpStub.put).toHaveBeenCalledWith(`/cases/${caseId}/users/${userId}`, {
      case_roles: [
        '[CREATOR]',
        '[OWNER]',
      ],
    });
  });
});

describe('revokeGroupAccess', () => {
  test('should revoke access from group', async () => {
    const caseId = '1234123412341238';
    const groupId = 'group-123';
    const httpStub = {
      put: jest.fn(() => Promise.resolve({status: 204})),
    };

    await revokeGroupAccess(httpStub)(caseId)(groupId);

    expect(httpStub.put).toHaveBeenCalledWith(`/cases/${caseId}/groups/${groupId}`, {
      case_roles: [],
    });
  });
});

describe('revokeUserAccess', () => {
  test('should revoke access from user', async () => {
    const caseId = '1234123412341238';
    const userId = 'user-123';
    const httpStub = {
      put: jest.fn(() => Promise.resolve({status: 204})),
    };

    await revokeUserAccess(httpStub)(caseId)(userId);

    expect(httpStub.put).toHaveBeenCalledWith(`/cases/${caseId}/users/${userId}`, {
      case_roles: [],
    });
  });
});
