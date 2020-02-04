import {isNo, isYes} from './field';

describe('isNo', () => {
  test('should be true when value is `No`', () => {
    expect(isNo('No')).toBe(true);
  });

  test('should be false when value is not `No`', () => {
    expect(isNo('Yes')).toBe(false);
  });

  test('should be false when value is `null`', () => {
    expect(isNo(null)).toBe(false);
  });

  test('should handle value as case-insensitive', () => {
    expect(isNo('no')).toBe(true);
  });
});

describe('isYes', () => {
  test('should be true when value is `Yes`', () => {
    expect(isYes('Yes')).toBe(true);
  });

  test('should be false when value is not `Yes`', () => {
    expect(isYes('No')).toBe(false);
  });

  test('should be false when value is `null`', () => {
    expect(isYes(null)).toBe(false);
  });

  test('should handle value as case-insensitive', () => {
    expect(isYes('yes')).toBe(true);
  });
});
