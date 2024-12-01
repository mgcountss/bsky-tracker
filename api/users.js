import express from 'express';
import fetch from 'node-fetch';
import db from '../services/db.js';
const router = express.Router();

async function getUsers(ids) {
    try {
        if (ids.length > 25) {
            return {
                "error": "Too many ids (max 25)",
                "success": false,
                "code": 400
            };
        }
        return await fetch('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfiles?actors=' + ids.join("&actors="), {
            method: 'GET'
        })
            .then(response => response.json())
            .then(async data => {
                data = data.profiles;
                for (let i = 0; i < data.length; i++) {
                    db.ensure(data[i].did, data[i]);
                }
                if (data.error) {
                    return {
                        "error": "user not found",
                        "success": false,
                        "code": 404
                    };
                }
                return {
                    "users": data,
                    "success": true,
                    "code": 200
                };
            }).catch(error => {
                return {
                    "error": "internal server error",
                    "success": false,
                    "code": 500
                };
            });
    } catch (error) {
        return {
            "error": "internal server error",
            "success": false,
            "code": 500
        };
    };
}

router.post('/', async (req, res) => {
    if (!req.body.ids) {
        return res.status(400).send({
            "error": "missing ids",
            "success": false
        });
    }
    await getUser(req.body.ids).then(data => {
        let code = data.code;
        delete data.code;
        res.status(code).send(data);
    });
});



export default router;
export { getUsers };