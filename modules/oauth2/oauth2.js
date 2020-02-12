import axios from 'axios';

export const postToken = (config, params) => axios.post(
  config.tokenEndpoint,
  new URLSearchParams(params),
  {
    headers: {
       authorization: authorizationHeader(config),
    },
  });

const authorizationHeader = (config) => 'Basic ' + Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
