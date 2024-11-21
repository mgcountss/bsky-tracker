import express from 'express';
import fetch from 'node-fetch';
import db from '../services/db.js';
import { getUser } from './user.js';
const router = express.Router();

async function searchUser(search_text) {
    try {
        return await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.searchActors?q=${search_text}`, {
            method: 'GET'
        }).then(response => response.json())
            .then(async data => {
                let results = [];
                data = data.actors;
                for (let i = 0; i < data.length; i++) {
                    let user = db.get(data[i].did);
                    if (!user) {
                        user = await getUser(data[i].did);
                    }
                    results.push({
                        "did": data[i].did,
                        "handle": data[i].handle,
                        "avatar": data[i].avatar,
                        "createdAt": data[i].createdAt,
                        "displayName": data[i].displayName
                    })
                }
                return {
                    "results": results.slice(0, 12),
                    "success": true,
                    "code": 200
                };
            }).catch(error => {
                console.log(error);
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
    if (!req.body.search_text) {
        return res.status(400).send({
            "error": "missing search_text",
            "success": false
        });
    }
    await searchUser(req.body.search_text).then(data => {
        let code = data.code;
        delete data.code;
        res.status(code).send(data);
    });
});

export default router;
export { searchUser };