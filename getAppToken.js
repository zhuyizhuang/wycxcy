const crypto = require('crypto-js');
import {Base64, generateSignature, buildURL} from './encode'
function generateApp_signature(app_key,secret) {
  function hmacSha256(message, secretKey) {

    const hmac = crypto.HmacSHA256(message, secretKey)
    return hmac.toString();
  }
  const signature = Base64.encode(hmacSha256(app_key, secret))

  return signature;
}
export const getToken = ({
  params = {},
  path = '/jdyconnector/app_management/kingdee_auth_token',
  method = 'GET',
  appSecret = '42dbb95549efa327c617250efd39845c',
  clientId = '277152',
}) => {
  const headers = {
    'x-api-nonce': '1655775240000',
    'x-api-timestamp': Date.now()
  };
  const app_signature = generateApp_signature(params.app_key, appSecret);
  console.log(appSecret);
  params.app_signature = app_signature;
  const signature = generateSignature(method, path, params, headers, appSecret);
  const url = buildURL(`https://api.kingdee.com${path}`,params)
  return new Promise((resolve,reject) => {
    var config = {
      method,
      url: url,
      header: {
        'X-Api-ClientID': clientId,
        'X-Api-Auth-Version': '2.0',
        'X-Api-SignHeaders': 'X-Api-TimeStamp,X-Api-Nonce',
        'Content-Type': 'application/json',
        ...Object.entries(headers).reduce((acc, [key, value]) => {
          acc[key.toUpperCase()] = value
          return acc
        }, {}),
        'X-Api-Signature': signature,
      },
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    };
    wx.request(config)
  })
}

