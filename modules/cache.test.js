import {useCache} from './cache';

describe('useCache', () => {
  test('should get undefined when no value in cache', () => {
    const [getValue, setValue] = useCache();

    setValue('otherKey')('value');

    expect(getValue('key')).toBeUndefined();
  });

  test('should get value when in cache', () => {
    const [getValue, setValue] = useCache();

    setValue('key')('value');

    expect(getValue('key')).toEqual('value');
  });

  test('should evict expired value', async () => {
    const [getValue, setValue] = useCache({ttlMs: 2});

    setValue('key')('value');

    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(getValue('key')).toBeUndefined();
  });
});
