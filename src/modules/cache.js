/**
 * Creates a new cache.
 * @param {object} config Configuration for caching mechanism
 * @return {array} Array containing a getter and setter function for the cache
 */
export const useCache = (config = {}) => {
  const cache = {};
  const get = (key) => cache[key] && cache[key].expiresAt > Date.now() ? cache[key].value : undefined;
  const set = (key) => (value) => (cache[key] = {value, expiresAt: Date.now() + (config.ttlMs || 30 * 1000)}) && value;
  return [get, set];
};
