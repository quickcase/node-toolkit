import axios from 'axios';

export const httpClient = (baseUrl) => (accessTokenProvider)  => Object.freeze({
  get: getRequest(urlBuilder(baseUrl))(accessTokenProvider),
  post: postRequest(urlBuilder(baseUrl))(accessTokenProvider),
  put: putRequest(urlBuilder(baseUrl))(accessTokenProvider),
});

const getRequest = (url) => (accessTokenProvider) => async (relativeUrl) => axios.get(url(relativeUrl), headers(await authorization(accessTokenProvider)));

const bodyRequest = (axiosFn) => (url) => (accessTokenProvider) => async (relativeUrl, body) => axiosFn(url(relativeUrl), body, headers(await authorization(accessTokenProvider)));

const postRequest = bodyRequest(axios.post);

const putRequest = bodyRequest(axios.put);

const urlBuilder = (baseUrl) => (relativeUrl) => baseUrl + relativeUrl;

const headers = (...args) => ({headers: Object.assign({}, ...args)});

const authorization = async (accessTokenProvider) => ({
  'Authorization': `Bearer ${await accessTokenProvider()}`,
});
