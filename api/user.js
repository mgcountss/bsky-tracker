import express from 'express';
import fetch from 'node-fetch';
import db from '../services/db.js';
const router = express.Router();

async function getUser(id) {
    try {
        return await fetch('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=' + id, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(async data => {
                if (data.error) {
                    if (db.has(id)) {
                        db.set(id, 'deleted', true);
                        return {
                            "user": db.get(id),
                            "success": true,
                            "code": 200
                        }
                    }
                    return {
                        "error": "user not found",
                        "success": false,
                        "code": 404
                    };
                }
                db.ensure(data.did, data);
                return {
                    "user": data,
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
    if (req.body.name) {
        req.body.id = db.get(req.body.name);
    }
    if (req.body.id) {
        await getUser(req.body.id).then(data => {
            let code = data.code;
            delete data.code;
            res.status(code).send(data);
        });
    } else {
        res.status(400).send({
            "error": "invalid request",
            "success": false
        });
    }
});

export default router;
export { getUser };
