import {fieldExtractor} from './case';

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
