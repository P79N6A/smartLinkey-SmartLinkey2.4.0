import request from '../utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  // return request('/api/currentUser');
}

export async function getWord01(params) {
  // return request('https://www.easy-mock.com/mock/5b2de5fd3bd2c939a1040679/getWord01', {
  return request(`${configUrl.rybjxx}/getDataInfo`, {
    method: 'Post',
    body: params,
  });
}
export async function getLoginIp(params) {
  return request(`${configUrl.testUrl}/lowcase/lastLoginLog`, {
    method: 'POST',
    body: params,
  });
}
export async function getSocketList(params) {
  return request(`${configUrl.slkMessage}/message/query`, {
    method: 'POst',
    body: params,
  });
}
export async function getSearch(params) {
  return request(`${configUrl.jz_search}/information/informationSearchGet`, {
    method: 'POST',
    body: params,
  });
}
export async function getSacwSearch(params) {
  return request(`${configUrl.jz_search}/information/informationSearchGet.do`, {
    method: 'POST',
    body: params,
  });
}
export async function getConfig() {
  return request(`${configUrls.serve}/api/config`, {
    method: 'GET',
  });
}
export async function getAgSerach() {
  return request(`${configUrl.jz_search}/information`, {
    method: 'get',
  });
}
export async function getIcons() {
  return request(`${configUrls.serve}/api/icon`, {
    method: 'GET',
  });
}
export async function getfkForm() {
  return request(`${configUrls.serve}/api/reply-layout`, {
    method: 'GET',
  });
}
export async function questionStatus(params) {
  return request(`${configUrl.questionStatus}/questionDbfk`, {
    method: 'POST',
    body: params,
  });
}
export async function getiNactive(params) {
  return request(`${configUrl.slkMessage}/message/update/inactive`, {
    method: 'POST',
    body: params,
  });
}
export async function getUnreadList(params) {
  return request(`${configUrl.slkMessage}/message/unread/query`, {
    method: 'POst',
    body: params,
  });
}
