const randomCharGenerator = () => {
  const randomChar = Math.random().toString(36).substring(2, 3);
  return randomChar;
};

const randomStringGenerator = (length) => {
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += randomCharGenerator();
  }
  return randomString;
}

let num = 0;
while (num < 100) {
  fetch("https://www.bsky-tracker.xyz/api/search", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.6",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Brave\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1"
    },
    "referrer": "https://www.bsky-tracker.xyz/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": `{"search_text":"${randomStringGenerator(3)}"}`,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  });
  num++;
}