import {postToken} from './oauth2';

const DEFAULT_CACHE_TTL = 60;

const newCache = () => ({});

const cachedTokenProvider = (cache) => (config) => async () => getTokenFromCache(cache) || cacheToken(cache)(getTtl(config))(await getNewToken(config));

/**
 * @typedef {object} ClientAccessTokenConfig
 * @property {number} cacheTtl Time-to-live for cache in seconds, defaults to 60
 * @property {string} tokenEndpoint URL of the OAuth2 `/token` endpoint for the IDAM server
 * @property {string} clientId OAuth2 client ID
 * @property {string} clientSecret OAuth2 client secret
 */
/**
 * Provides a valid OAuth2 client access token as per OAuth2's client credentials flow.
 *
 * @param {ClientAccessTokenConfig} config Configuration for generation of client access tokens
 * @return {Promise} Promise resolved with the access token value
 */
export const clientAccessTokenProvider = (config) => cachedTokenProvider(newCache())(config);

const getTokenFromCache = (cache) => cache.accessToken;

const getTtl = ({cacheTtl}) => typeof cacheTtl === 'number' ? cacheTtl : DEFAULT_CACHE_TTL;

const cacheToken = (cache) => (ttl) => (token) => {
  scheduleExpiry(cache)(ttl);
  return cache.accessToken = token;
};

const scheduleExpiry = (cache) => (ttl) => {
  clearTimeout(cache.expire);
  cache.expire = setTimeout(expireCache(cache), ttl  * 1000);
};

const expireCache = (cache) => () => cache.accessToken = undefined;

const getNewToken = async (config) => extractToken(await postToken(config, params(config)));

const extractToken = (response) => response.data.access_token;

const params = (config) => ({
  ...config,
  grant_type: 'client_credentials',
});
