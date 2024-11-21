import express from 'express';
import db from '../services/db.js';
const router = express.Router();

async function getHistory(id) {
    try {
        if (db.has(id)) {
            return {
                "history": db.get(id).daily,
                "success": true,
                "code": 200
            };
        } else {
            return {
                "error": "user not found",
                "success": false,
                "code": 404
            };
        }
    } catch (error) {
        return {
            "error": "internal server error",
            "success": false,
            "code": 500
        };
    };
}

router.post('/', async (req, res) => {
    if (!req.body.id) {
        return res.status(400).send({
            "error": "missing id",
            "success": false
        });
    }
    await getHistory(req.body.id).then((data) => {
        let code = data.code;
        delete data.code;
        res.status(code).send(data);
    });
});

export default router;
export { getHistory };