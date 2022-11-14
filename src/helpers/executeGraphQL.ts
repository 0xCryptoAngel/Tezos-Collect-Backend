import fetch from 'node-fetch';

const executeGraphQl = async (url: string, body: string) => {
  return await fetch(url, {
    headers: {
      accept: 'application/json',
      'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
      'content-type': 'application/json',
      'sec-ch-ua':
        '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      cookie: 'ai_user=QPsH+kLj3D18rTkDqD8Ut8|2022-09-22T05:55:26.464Z',
      Referer: 'https://data.objkt.com/explore/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: body,
    method: 'POST',
  });
};

export default executeGraphQl;
