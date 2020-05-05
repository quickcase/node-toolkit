import {postToken} from './oauth2';

/**
 * Exchange an OAuth2 code for tokens as part of an OAuth2 authorization code grant.
 *
 * @param {OAuth2TokenConfig} config Configuration for generation of client access tokens
 * @param {string} redirectUri Redirect URI used in the generation of the code
 * @param {string} code Code generated as part of user login
 * @return {Promise} Promise resolved with the token values (access, id and refresh)
 */
export const exchangeOAuth2Code = (config) => (redirectUri) => async (code) => {
  const res = await postToken(config, params(redirectUri, code));
  return res.data;
};

const params = (redirectUri, code) => ({
  code: code,
  grant_type: 'authorization_code',
  redirect_uri: redirectUri,
});
