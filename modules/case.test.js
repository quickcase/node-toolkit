import {
  fetchCase,
  fieldExtractor,
  grantGroupAccess,
  grantUserAccess,
  isCaseIdentifier,
} from './case';

describe('fetchCase', () => {
  test('should fetch case by id', async () => {
    const caseId = '1234123412341238';
    const resData = {
      id: caseId,
      data: {},
    };
    const httpStub = {
      get: (url) => {
        expect(url).toEqual(`/cases/${caseId}`);
        return Promise.resolve({data: resData});
      },
    };

    const actualData = await fetchCase(httpStub)(caseId)();
    expect(actualData).toEqual(resData);
  });
});

describe('fieldExtractor', () => {
  test('should extract field from case `data`', () => {
    const aCase = {
      data: {
        level1: {
          level2: 'value'
        }
      }
    };

    const fieldValue = fieldExtractor(aCase)('level1.level2');
    expect(fieldValue).toEqual('value');
  });

  test('should extract field from case `case_data`', () => {
    const aCase = {
      data: {
        level1: {
          level2: 'value'
        }
      }
    };

    const fieldValue = fieldExtractor(aCase)('level1.level2');
    expect(fieldValue).toEqual('value');
  });

  test('should extract field as undefined when path does not exist', () => {
    const aCase = {
      data: {
        level1: {
          level2: 'value'
        }
      }
    };

    const fieldValue = fieldExtractor(aCase)('nolevel.level2');
    expect(fieldValue).toBeUndefined();
  });

  test('should extract field as undefined when case has no data', () => {
    const aCase = {};

    const fieldValue = fieldExtractor(aCase)('level1.level2');
    expect(fieldValue).toBeUndefined();
  });
});

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

describe('isCaseIdentifier', () => {
  test('should be false when length is less than 16 characters', () => {
    expect(isCaseIdentifier('1234')).toBe(false);
  });

  test('should be false when length is more than 16 characters', () => {
    expect(isCaseIdentifier('12345678901234567890')).toBe(false);
  });

  test('should be false when contains characters others than digits', () => {
    expect(isCaseIdentifier('123412341234123A')).toBe(false);
  });

  test('should be false when check digit does not match', () => {
    expect(isCaseIdentifier('1234123412341234')).toBe(false);
  });

  test.each([
    '1234123412341238',
    '1579871203156511',
    '1579873635774838',
    1579873635774838,
  ])('should be true when 16-digit number with correct check digit: %s', (identifier) => {
    expect(isCaseIdentifier(identifier)).toBe(true);
  });
});
