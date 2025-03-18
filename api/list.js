import express from 'express';
import db from '../services/db.js';
const router = express.Router();

async function getUsers(start, end, sort, order, removeDaily) {
    try {
        let newData = db.sortData(sort, order, start, end);
        newData = [...newData];
        newData = JSON.parse(JSON.stringify(newData));
        if (removeDaily) {
            for (let i = 0; i < newData.length; i++) {
                delete newData[i][1].daily;
            }
        }
        return {
            "data": newData,
            "success": true,
            "code": 200
        };
    } catch (error) {
        console.log(error);
        return {
            "error": "internal server error",
            "success": false,
            "code": 500
        };
    };
};

async function getUser(id) {
    try {
        let data = db.get(id);
        if (!data) {
            return {
                "error": "user not found",
                "success": false,
                "code": 404
            };
        }
        return {
            "user": data,
            "success": true,
            "code": 200
        };
    } catch (error) {
        console.log(error);
        return {
            "error": "internal server error",
            "success": false,
            "code": 500
        };
    };
};

router.post('/', async (req, res) => {
    try {
        if (req.body.force) {
            return await getUser(req.body.force).then(data => {
                let code = data.code;
                delete data.code;
                res.status(code).send(data);
            });
        } else {
            if (req.body.type == 'users') {
                if ((req.body.start || req.body.start == 0) && (req.body.end) && (req.body.sort) && (req.body.order)) {
                    return await getUsers(req.body.start, req.body.end, req.body.sort, req.body.order, true).then(data => {
                        let code = data.code;
                        delete data.code;
                        res.status(code).send(data);
                    });
                }
            } else {
                return res.status(400).send({
                    "error": "invalid request",
                    "success": false
                });
            }
            return res.status(400).send({
                "error": "missing start, end, sort, order, or type",
                "success": false
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            "error": "internal server error",
            "success": false
        });
    }
});

export default router;
export { getUsers };