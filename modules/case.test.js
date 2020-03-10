import {
  fetchCase,
  fieldExtractor,
  idFrom36,
  idTo36,
  isCaseIdentifier,
  isCaseIdentifier36,
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

describe('idTo36', () => {
  test('should encode case identifier to base36', () => {
    expect(idTo36('1583178988495195')).toBe('0fl6udxa2qj');
  });

  test('should encode number to base36 with 0-padding', () => {
    expect(idTo36('1234567890')).toBe('00000kf12oi');
  });
});

describe('idFrom36', () => {
  test('should decode case identifier from base36', () => {
    expect(idFrom36('0fl6udxa2qj')).toBe('1583178988495195');
  });

  test('should decode number from base36 with 0-padding', () => {
    expect(idFrom36('00000kf12oi')).toBe('1234567890');
  });
});

describe('isCaseIdentifier36', () => {
  test('should return true when the string is a base 36 representation of case identifier', () => {
    expect(isCaseIdentifier36('0fl6udxa2qj')).toBe(true);
  });

  test('should return false when the string is not a base 36 representation of case identifier', () => {
    expect(isCaseIdentifier36('00000kf12oi')).toBe(false);
  });
});
