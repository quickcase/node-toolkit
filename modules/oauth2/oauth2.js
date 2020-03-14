import axios from 'axios';

/**
 * @typedef {object} OAuth2TokenConfig
 * @property {string} tokenEndpoint URL of the OAuth2 `/token` endpoint for the IDAM server
 * @property {string} clientId OAuth2 client ID
 * @property {string} clientSecret OAuth2 client secret
 */
/**
* POST request to provided OAuth2 /tokens endpoint.
*
* @param {OAuth2TokenConfig} config Configuration for generation of client access tokens
* @param {object} params Key-value pairs which will be converted to URLSearchParams and posted as the request body
* @return {Promise} Promise resolved with Axios response to the request
*/
export const postToken = (config, params) => axios.post(
  config.tokenEndpoint,
  new URLSearchParams(params),
  {
    headers: {
       authorization: authorizationHeader(config),
    },
  });

const authorizationHeader = (config) => 'Basic ' + Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

/**
 * @callback AccessTokenSupplier
 * @param {ExpressJsRequest} req ExpressJS request instance
 * @return {string} Access token if found, `null` or `undefined` otherwise
 */

 /**
  * Tries to extract an access token from a parsed cookie on an ExpressJS request.
  *
  * @param {string} header Name of the cookie from which access token should be extracted, defaults to `access_token`
  * @return {AccessTokenSupplier}
  */
 export const cookieAccessTokenSupplier = (cookie = 'access_token') => (req) => req.cookies[cookie];

/**
 * Tries to extract an access token from a header on an ExpressJS request.
 * The header value must comply to pattern `Bearer <accessToken>`.
 *
 * @param {string} header Name of the header from which access token should be extracted, defaults to `Authorization`
 * @return {AccessTokenSupplier}
 */
export const headerAccessTokenSupplier = (header = 'Authorization') => (req) => {
  const authorization = req.get(header);

  if (!authorization)
    return undefined;

  const match = /^Bearer (.+)$/.exec(authorization);

  if (!match)
    return undefined;

  return match[1];
};
