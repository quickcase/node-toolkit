import axios from 'axios';

const ifPresent = (claims) => (key, map, defaultValue) => claims[key] && claims[key] !== '' ? map(claims[key]) : defaultValue;

/**
 * @callback RolesExtractor
 * @param {object} claims User claims as key-value pairs
 * @return {string[]} Array of roles extracted from the user claims
 */
export const defaultRolesExtractor = (claims) => ifPresent(claims)('app_roles', (roles) => roles.split(','), []);

/**
 * @callback ScopeExtractor
 * @param {object} claims JWT claims as key-value pairs
 * @return {string[]} Array of scopes extracted from the claims
 */
export const defaultScopesExtractor = (claims) => ifPresent(claims)('scope', (scope) => scope.split(' '), []);

/**
 * @callback UserInfoRetriever
 * @param {string} accessToken access token to use to authenticate the request to `/userInfo` endpoint
 * @return {Promise} Promise resolve with user claims
 */

/**
 * @param {object} config Configuration with required `userInfoUri` property
 * @return {UserInfoRetriever} Ready-to-use instance of UserInfoRetriever
 */
export const defaultUserInfoRetriever = ({userInfoUri}) => (accessToken) => axios.get(userInfoUri, {headers: {'Authorization': `Bearer ${accessToken}`}}).then(res => res.data);
