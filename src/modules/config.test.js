import {mergeConfig} from './config';

describe('mergeConfig', () => {
  test('should return default configuration when no override provided', () => {
    const config = mergeConfig({prop1: 'value1'})(undefined);
    expect(config).toEqual({prop1: 'value1'});
  });

  test('should return default configuration when empty override provided', () => {
    const config = mergeConfig({prop1: 'value1'})({});
    expect(config).toEqual({prop1: 'value1'});
  });

  test('should override top-level properties', () => {
    const config = mergeConfig({
      prop1: 'value1',
      prop2: 'value2',
    })({
      prop1: 'value3',
    });
    expect(config).toEqual({prop1: 'value3', prop2: 'value2'});
  });

  test('should override nested properties', () => {
    const config = mergeConfig({
      prop1: 'value1',
      prop2: {
        prop21: 'value21',
        prop22: 'value22',
      },
    })({
      prop2: {
        prop22: 'value--'
      }
    });
    expect(config).toEqual({
      prop1: 'value1',
      prop2: {
        prop21: 'value21',
        prop22: 'value--',
      },
    });
  });

  test('should ignore incorrect parent node overrides', () => {
    const config = mergeConfig({
      prop1: 'value1',
      prop2: {
        prop21: 'value21',
        prop22: 'value22',
      },
    })({
      prop2: 'incorrect type',
    });
    expect(config).toEqual({
      prop1: 'value1',
      prop2: {
        prop21: 'value21',
        prop22: 'value22',
      },
    });
  });

  test('should accept null overrides', () => {
    const config = mergeConfig({
      prop1: 'value1',
      prop2: 'value2',
    })({
      prop2: null,
    });
    expect(config).toEqual({
      prop1: 'value1',
      prop2: null,
    });
  });
});
