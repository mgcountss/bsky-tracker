import fetch from 'node-fetch';
import fs from 'fs';
let access_token = process.env.ACCESS_TOKEN;
let refresh_token = process.env.REFRESH_TOKEN;

const getNewAccessToken = async () => {
    return await fetch('https://iimlchgzyhltrqkbtaqx.supabase.co/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + access_token,
            'Apikey': process.env.API_KEY,
        },
        body: JSON.stringify({
            "refresh_token": refresh_token
        })
    }).then(response => response.json())
        .then(data => {
           // console.log(data);
            access_token = data.access_token;
            refresh_token = data.refresh_token;
            if (access_token && refresh_token) {
                let newEnv = {
                    ACCESS_TOKEN: access_token,
                    REFRESH_TOKEN: refresh_token,
                    API_KEY: process.env.API_KEY,
                    NODE_ENV: process.env.NODE_ENV,
                    DOMAIN: process.env.DOMAIN
                };
                fs.writeFileSync('.env', '');
                for (let key in newEnv) {
                    fs.appendFileSync('.env', `${key}=${newEnv[key]}\n`);
                }
                return {
                    access_token: access_token
                };
            } else {
                return {
                    access_token: process.env.ACCESS_TOKEN,
                    failed: true
                };
            }
        }).catch(error => {
            console.log(error);
            return {
                access_token: process.env.ACCESS_TOKEN,
                failed: true
            };
        });
}

//getNewAccessToken();

setInterval(() => {
    getNewAccessToken();
}, 1000 * 60 * 60 * 4);

export { getNewAccessToken };
export { access_token };

/*function otherThing() {
    fetch('https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/rpc/increment_bluesky_count', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + access_token,
            'Apikey': process.env.API_KEY,
        },
        body: JSON.stringify({
            "arg_post_id": "b3f0c3b8-3c0d-4ded-87af-11ff126d3cd7"
        })
    }).then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.log(error));
}

setInterval(() => {
   otherThing();
}, 1);*/