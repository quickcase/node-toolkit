import {stubConfig} from './node-config';

describe('stubConfig', () => {
  test('should have recursive `has(property) implementation`', () => {
    const config = stubConfig({hello: {world: 'foobar'}});

    expect(config.has('hello')).toBe(true);
    expect(config.has('hello.world')).toBe(true);
    expect(config.has('other')).toBe(false);
    expect(config.has('hello.other')).toBe(false);
    expect(config.has(null)).toBe(false);
    expect(config.has(undefined)).toBe(false);
  });

  test('should have recursive `get(property) implementation`', () => {
    const config = stubConfig({hello: {world: 'foobar'}, top: 'yes', null: null});

    expect(config.get('top')).toBe('yes');
    expect(config.get('hello.world')).toBe('foobar');
    expect(config.get('not.found')).toBe(undefined);
    expect(config.get('null.found')).toBe(undefined);

    expect(() => config.get(undefined)).toThrow();
    expect(() => config.get(null)).toThrow();
  });
});
