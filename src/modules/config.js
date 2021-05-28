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
