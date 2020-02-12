import {postToken} from './oauth2';

/**
 * Generates a new set of valid OAuth2 tokens from a refresh token.
 *
 * @param {OAuth2TokenConfig} config Configuration for generation of client access tokens
 * @param {string} refreshToken Valid refresh token
 * @return {Promise} Promise resolved with the token values (access, id and refresh)
 */
export const refreshOAuth2Tokens = (config) => async (refreshToken) => {
  const res = await postToken(config, params(refreshToken));
  return res.data;
};

const params = (refreshToken) => ({
  refresh_token: refreshToken,
  grant_type: 'refresh_token',
});
