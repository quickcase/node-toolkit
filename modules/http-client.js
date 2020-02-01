import axios from 'axios';

export const httpClient = (baseUrl) => (accessTokenProvider)  => Object.freeze({
  get: getRequest(urlBuilder(baseUrl))(accessTokenProvider),
  post: postRequest(urlBuilder(baseUrl))(accessTokenProvider),
});

const getRequest = (url) => (accessTokenProvider) => async (relativeUrl) => axios.get(url(relativeUrl), headers(await authorization(accessTokenProvider)));

const postRequest = (url) => (accessTokenProvider) => async (relativeUrl, body) => axios.post(url(relativeUrl), body, headers(await authorization(accessTokenProvider)));

const urlBuilder = (baseUrl) => (relativeUrl) => baseUrl + relativeUrl;

const headers = (...args) => ({headers: Object.assign({}, ...args)});

const authorization = async (accessTokenProvider) => ({
  'Authorization': `Bearer ${await accessTokenProvider()}`,
});
