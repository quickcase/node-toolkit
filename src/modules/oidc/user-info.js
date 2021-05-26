import axios from 'axios';

export const userInfoRetriever = ({userInfoUri}) => (accessToken) =>
  axios.get(userInfoUri, {headers: {'Authorization': `Bearer ${accessToken}`}}).then(res => res.data);
