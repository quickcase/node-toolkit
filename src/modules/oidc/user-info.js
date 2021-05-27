import axios from 'axios';

const DEFAULT_PREFIX = '';

const PUBLIC_CLAIMS = ['sub', 'name', 'email'];
const PRIVATE_CLAIMS = ['roles', 'organisations'];

export const claimNamesProvider = (config) => () => {
  const prefix = typeof config.prefix === 'string' ? config.prefix : DEFAULT_PREFIX;
  const {names} = config;
  return {
    ...PUBLIC_CLAIMS.reduce((acc, claim) => ({...acc, [claim]: names[claim]}), {}),
    ...PRIVATE_CLAIMS.reduce((acc, claim) => ({...acc, [claim]: prefix + names[claim]}), {}),
  };
};

export const userInfoRetriever = ({userInfoUri}) => (accessToken) =>
  axios.get(userInfoUri, {headers: {'Authorization': `Bearer ${accessToken}`}}).then(res => res.data);

export const userInfoExtractor = (claimNamesProvider) => (userInfo) => {
  const claimNames = claimNamesProvider();

  const claimsSchema = [
    {key: 'sub'},
    {key: 'name'},
    {key: 'email'},
    {key: 'roles', map: (roles) => roles.split(','), defaultValue: []},
    {key: 'organisations', map: JSON.parse, defaultValue: {}},
  ];

  return claimsSchema.reduce((acc, {key, map = (i) => i, defaultValue}) => {
    const rawValue = userInfo[claimNames[key]];
    const value = (rawValue !== undefined && rawValue !== null) ? map(rawValue) : defaultValue;
    return {...acc, [key]: value};
  }, {});
};
