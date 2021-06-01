import camelCase from 'camelcase';

export const mergeConfig = (defaultConfig) => (override = {}) => {
  const mergedEntries = Object.entries(defaultConfig)
                              .map(([key, sourceValue]) => [key, sourceValue, override[key]])
                              .map(mergeConfigEntry);
  return Object.fromEntries(mergedEntries);
};

const mergeConfigEntry = ([key, sourceValue, overrideValue]) => {
  if (sourceValue && typeof sourceValue === 'object') {
    if (overrideValue && typeof overrideValue === 'object') {
      return [key, mergeConfig(sourceValue)(overrideValue)];
    }
    return [key, sourceValue];
  }
  return [key, overrideValue !== undefined ? overrideValue : sourceValue];
};

export const camelConfig = (config) => {
  const entries = Object.entries(config)
                        .map(camelConfigEntry);
  return Object.fromEntries(entries);
};

const camelConfigEntry = ([key, value]) => {
  if (value && typeof value === 'object') {
    return [camelCase(key), camelConfig(value)];
  }

  return [camelCase(key), value];
};
