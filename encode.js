//import crypto from 'crypto-js'

function generateSignature(method, path, params, headers, sercet) {
  const crypto = require('crypto-js');

  function hmacSha256(message, secretKey) {

    // const hmac = crypto.createHmac('sha256', secretKey);
    //   hmac.update(message);
    const hmac = crypto.HmacSHA256(message, secretKey)
    return hmac.toString();
  }

  const Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      input = Base64._utf8_encode(input);
      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      }
      return output;
    },
    decode: function (input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
      output = Base64._utf8_decode(output);
      return output;
    },
    _utf8_encode: function (string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";
      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    },
    _utf8_decode: function (utftext) {
      var string = "";
      var i = 0;
      var c = c1 = c2 = 0;
      while (i < utftext.length) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if ((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      return string;
    }
  }

  // Step 1: 对参数进行排序
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`);

  // Step 2: 构建签名原文
  const signatureText = [
    method.toUpperCase(), // 请求方式大写
    encodeURIComponent(path),
    sortedParams.join('&'), // 请求参数
    `x-api-nonce:${headers['x-api-nonce']}`, // x-api-nonce
    `x-api-timestamp:${headers['x-api-timestamp']}` + '\n'
  ].join('\n');

  const signature = Base64.encode(hmacSha256(signatureText, sercet))

  return signature;
}
function buildURL(url, params) {
  if (!params) {
    return url;
  }
  for(let [key,value] of Object.entries(params)) {
    key = encodeURIComponent(key);
    value = encodeURIComponent(value);
  // params序列化过程略
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);  
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + `${key}=${value}`;
  }

  return url;
};
export const request = ({
  method = 'GET',
  path = '',
  params = {},
  data = {},
  sercet = '42dbb95549efa327c617250efd39845c',
  clientId = '277152'
}) => {
  const headers = {
    'x-api-nonce': '1655775240000',
    'x-api-timestamp': Date.now()
  };
  const signature = generateSignature(method, path, params, headers, sercet);
  const url = buildURL(`https://api.kingdee.com${path}`,params)
  return new Promise((resolve,reject) => {
    var config = {
      method,
      url: url,
      // params,
      data,
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