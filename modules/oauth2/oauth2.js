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
