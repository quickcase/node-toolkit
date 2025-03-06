import axios from 'axios';

/**
 * @callback AccessTokenProvider
 * @return {Promise} Promise resolved with a valid OAuth2 Bearer token
 */

/**
 * Create an instance of a configured httpClient.
 *
 * @param {string} baseUrl Root URL to which relative path will be appended when performing requests.
 * @param {Axios} axiosInstance Optional. Custom Axios instance as created by `axios.create()`. Defaults to global `axios` instance.
 * @param {AccessTokenProvider} accessTokenProvider Async function returning an OAuth2 Bearer token.
 */
export const httpClient = (baseUrl, axiosInstance = axios) => (accessTokenProvider) => Object.freeze({
  get: emptyRequest(axiosInstance.get)(urlBuilder(baseUrl))(accessTokenProvider),
  post: bodyRequest(axiosInstance.post)(urlBuilder(baseUrl))(accessTokenProvider),
  put: bodyRequest(axiosInstance.put)(urlBuilder(baseUrl))(accessTokenProvider),
});

const emptyRequest = (axiosFn) => (url) => (accessTokenProvider) => async (relativeUrl, params) => axiosFn(url(relativeUrl), {
  ...headers(await authorization(accessTokenProvider)),
  params,
});

const bodyRequest = (axiosFn) => (url) => (accessTokenProvider) => async (relativeUrl, body, params) => axiosFn(url(relativeUrl), body, {
  ...headers(await authorization(accessTokenProvider)),
  params,
});

const urlBuilder = (baseUrl) => (relativeUrl) => baseUrl + relativeUrl;

const headers = (...args) => ({headers: Object.assign({}, ...args)});

const authorization = async (accessTokenProvider) => ({
  'Authorization': `Bearer ${await accessTokenProvider()}`,
});
