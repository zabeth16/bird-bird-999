// eBird API
const myHeaders = new Headers();
myHeaders.append("X-eBirdApiToken", "bhq1h52jvau2");

export const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};