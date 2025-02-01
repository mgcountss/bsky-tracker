import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import updateAllUsers from './services/updateAllUsers.js';
import moment from 'moment';
import db from './services/db.js';
import makePost from './services/makePost.js';

const app = express();
app.set('trust proxy', true);

const __dirname = path.resolve();
app.use(bodyParser.json());
app.set('view engine', 'ejs');
let userFunctions = {};

app.use('*', (req, res, next) => {
    /*
    console.log('Request Info:', {
        host: req.headers.host,
        url: req.url,
        originalUrl: req.originalUrl,
        method: req.method,
        headers: req.headers
    });
    next();*/
    const host = req.headers.host;
    if (host.includes('bluesky.mgcounts.com')) {
        const targetHost = 'www.bsky-tracker.xyz';
        const targetUrl = `https://${targetHost}${req.originalUrl}`;
        console.log('Redirecting to:', targetUrl);
        return res.redirect(targetUrl);
    }
    next();
});

fs.readdirSync('./api/').forEach(async (file) => {
    const route = await import(`./api/${file}`);
    app.use('/api/' + file.split('.')[0], route.default);
    eval(`userFunctions.${file.split('.')[0]} = Object.values(route)[1]`);
});

app.get('/images/*', (req, res) => {
    res.sendFile(__dirname + req.url);
});

let channels = db.getTheChannels();
let channelCount = db.keys();

app.get('/', async (req, res) => {
    res.render('index', {
        channels: channels,
        channelCount: channelCount.length,
        moment: moment,
        url: "index"
    });
});

setInterval(function () {
    channels = db.getTheChannels();
    channelCount = db.keys();
}, 60000);

app.get('/user/:id', async (req, res) => {
    try {
        const user = await userFunctions.user(req.params.id);
        const history = await userFunctions.history(req.params.id);
        if (user.success) {
            res.render('user', {
                user: user.user,
                history: history.history,
                moment: moment,
                url: "user/" + req.params.id
            });
        } else {
            res.render('error', {
                error: user.error,
                url: "error"
            });
        }
    } catch (error) {
        console.log(error);
        res.render('error', {
            error: error,
            url: "error"
        });
    }
});

app.get('/compare/:id1/:id2', async (req, res) => {
    try {
        const user1 = await userFunctions.user(req.params.id1);
        const user2 = await userFunctions.user(req.params.id2);
        let history1 = await userFunctions.history(req.params.id1);
        let history2 = await userFunctions.history(req.params.id2);
        if (!history1) {
            history1 = { history: [] };
        }
        if (!history2) {
            history2 = { history: [] };
        }
        let olderDate = '1';
        if (Object.keys(history2.history).length > Object.keys(history1.history).length) {
            olderDate = '2';
        }
        if (user1.success && user2.success) {
            res.render('compare', {
                user1: user1.user,
                user2: user2.user,
                history1: history1.history,
                history2: history2.history,
                olderDate: olderDate,
                moment: moment,
                url: "compare/" + req.params.id1 + "/" + req.params.id2
            });
        } else {
            res.render('error', {
                error: user1.error || user2.error,
                url: "error"
            });
        }
    } catch (error) {
        res.render('error', {
            error: error,
            url: "error"
        });
    }
});

app.get('/compare/search', async (req, res) => {
    res.render('compare_search', {
        url: "compare_search"
    });
});

app.get('/lists/:type', (req, res) => {
    if (req.params.type == 'users') {
        res.render('list', {
            total: channelCount.length,
            type: 'Users',
            options: [
                { "name": "Followers", "value": "followersCount" },
                { "name": "Posts", "value": "postsCount" },
                { "name": "Following", "value": "followsCount" },
                { "name": "Follower Gain (1D)", "value": "follower_gain_24" },
                { "name": "Post Gain (1D)", "value": "post_gain_24" },
                { "name": "Following Gain (1D)", "value": "following_gain_24" },
                { "name": "Follower Gain (7D)", "value": "follower_gain_7" },
                { "name": "Post Gain (7D)", "value": "post_gain_7" },
                { "name": "Following Gain (7D)", "value": "following_gain_7" },
                { "name": "Display Name", "value": "displayName" },
                { "name": "Handle", "value": "handle" },
                { "name": "Date Joined", "value": "createdAt" }],
            url: "lists/users"
        });
    } else {
        res.render('error', {
            error: 'Invalid list type',
            url: "error"
        });
    }
});

app.get('/top50', (req, res) => {
    res.render('top50', {
        url: "top50"
    });
});

app.get('/css/*', (req, res) => {
    if (req.url.includes('?')) {
        req.url = req.url.split('?')[0];
    }
    res.sendFile(__dirname + '/views/css/' + req.url.split('/')[2]);
});

app.get('/js/*', (req, res) => {
    if (req.url.includes('?')) {
        req.url = req.url.split('?')[0];
    }
    res.sendFile(__dirname + '/views/js/' + req.url.split('/')[2]);
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/images/favicon.ico');
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(__dirname + '/views/assets/robots.txt');
});

app.get('/api/data/all', (req, res) => {
    let data = db.getAll();
    if (req.query.min && req.query.max) {
        let min = parseInt(req.query.min);
        let max = parseInt(req.query.max);
        let newData = {};
        for (let key in data) {
            if (parseInt(key) >= min && parseInt(key) <= max) {
                newData[key] = data[key];
            }
        }
        data = newData;
    }
    res.send(data);
});

let top50 = db.getTop50();
setInterval(function () {
    top50 = db.getTop50();
}, 5000);

app.post('/api/top50', (req, res) => {
    res.send(top50);
});

app.get('/ads/test', (req, res) => {
    res.render('ads', {
        url: "ads"
    });
});

app.get('/ads.txt', (req, res) => {
    res.sendFile(__dirname + '/views/assets/ads.txt');
});

app.get('*', (req, res) => {
    res.render('error', {
        error: '404 Not Found',
        url: "error"
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

setInterval(async () => {
    let time = new Date();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    if (minutes === 10) {
        await updateAllUsers();
        if (hours == 0) {
            //await makePost(true).catch(console.error);
        } else if (hours == 12) {
            await makePost().catch(console.error);
        }
    }
}, 60000);
updateAllUsers(50);
setTimeout(() => {
    updateAllUsers(50);
}, 5000);
//updateAllUsers();

process.on('SIGINT', () => {
    db.save();
    process.exit();
});