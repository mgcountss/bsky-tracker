import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import updateAllUsers from './services/updateAllUsers.js';
import moment from 'moment';
import db from './services/db.js';
import siteMapLol from './services/sitemap.js'
import makePost from './services/makePost.js';

const app = express();
const __dirname = path.resolve();
app.use(bodyParser.json());
app.set('view engine', 'ejs');
let userFunctions = {};

fs.readdirSync('./api/').forEach(async (file) => {
    const route = await import(`./api/${file}`);
    app.use('/api/' + file.split('.')[0], route.default);
    eval(`userFunctions.${file.split('.')[0]} = Object.values(route)[1]`);
});

app.get('/images/*', (req, res) => {
    res.sendFile(__dirname + req.url);
});

app.get('/', async (req, res) => {
    let channels = db.getTheChannels();
    let channelCount = db.keys();
    res.render('index', {
        channels: channels,
        channelCount: channelCount.length,
        moment: moment,
        url: "index"
    });
});

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
        const history1 = await userFunctions.history(req.params.id1);
        const history2 = await userFunctions.history(req.params.id2);
        if (user1.success && user2.success) {
            res.render('compare', {
                user1: user1.user,
                user2: user2.user,
                history1: history1.history,
                history2: history2.history,
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
        let total = db.keys().length;
        res.render('list', {
            total: total,
            type: 'Users',
            options: [
                { "name": "Followers", "value": "followersCount" },
                { "name": "Posts", "value": "postsCount" },
                { "name": "Following", "value": "followsCount" },
                { "name": "Follower Gain (1D)", "value": "follower_gain_24" },
                { "name": "Post Gain (1D)", "value": "post_gain_24" },
                { "name": "Following Gain (1D)", "value": "following_gain_24" },
                //{ "name": "Follower Gain (7D)", "value": "follower_gain_7" },
                //{ "name": "Post Gain (7D)", "value": "post_gain_7" },
                //{ "name": "Following Gain (7D)", "value": "following_gain_7" },
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

app.get('/sitemaps/*', (req, res) => {
    let file = req.url.split('/')[2];
    if (file.includes('.xml')) {
        res.sendFile(__dirname + '/sitemaps/' + file);
    } else {
        res.sendFile(__dirname + '/sitemaps/' + req.url.split('/')[2] + '/' + req.url.split('/')[3]);
    }
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/images/favicon.ico');
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(__dirname + '/views/assets/robots.txt');
});

app.get('/sitemap.xml', (req, res) => {
    res.sendFile(__dirname + '/views/assets/sitemap.xml');
});

app.get('/api/data/all', (req, res) => {
    let data = db.getAll();
    if (req.query.min && req.query.max) {
        data = data.slice(req.query.min, req.query.max);
    }
    res.send(data);
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
    if (minutes === 0) {
        await updateAllUsers();
        if (hours == 0) {
            await makePost(true).catch(console.error);
        } else if (hours == 12) {
            await makePost().catch(console.error);
        } else if (hours == 1) {
            siteMapLol();
        }
    }
}, 60000);
updateAllUsers();

process.on('SIGINT', () => {
    db.save();
    console.log('Saved database');
    process.exit();
});