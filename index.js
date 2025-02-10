import express from 'express';
import fs from 'fs';
import path from 'path';
import updateAllUsers from './services/updateAllUsers.js';
import moment from 'moment';
import db from './services/db.js';

const app = express();
const __dirname = path.resolve();

app.set('trust proxy', true);
app.set('view engine', 'ejs');
app.use(express.json()); // Built-in body parser

let userFunctions = {};

// Redirect `bluesky.mgcounts.com` requests
app.use('*', (req, res, next) => {
    if (req.headers.host.includes('bluesky.mgcounts.com')) {
        return res.redirect(`https://www.bsky-tracker.xyz${req.originalUrl}`);
    }
    next();
});

// Load API routes dynamically
fs.readdirSync('./api/').forEach(async (file) => {
    const route = await import(`./api/${file}`);
    const routeName = file.split('.')[0];
    app.use(`/api/${routeName}`, route.default);
    userFunctions[routeName] = route[Object.keys(route)[1]]; // Assign API functions
});

app.get('/images/*', (req, res) => {
    res.sendFile(__dirname + req.url);
});

app.get('/top50', (req, res) => {
    res.render('top50', {
        url: "top50"
    });
});

app.get('/compare/search', async (req, res) => {
    res.render('compare_search', {
        url: "compare_search"
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


app.get('/ads/test', (req, res) => {
    res.render('ads', {
        url: "ads"
    });
});

app.get('/ads.txt', (req, res) => {
    res.sendFile(__dirname + '/views/assets/ads.txt');
});

let channels = db.getTheChannels();
let channelCount = db.keys().length;

// **Helper function to render pages**
const renderPage = (res, view, options = {}) => {
    res.render(view, { moment, ...options });
};

// **Home Page**
app.get('/', (req, res) => renderPage(res, 'index', { channels, channelCount, url: "index" }));

// **User Page**
app.get('/user/:id', async (req, res) => {
    try {
        const user = await userFunctions.user(req.params.id);
        const history = await userFunctions.history(req.params.id) || { history: [] };

        if (user.success) {
            renderPage(res, 'user', { user: user.user, history: history.history, url: `user/${req.params.id}` });
        } else {
            renderPage(res, 'error', { error: user.error, url: "error" });
        }
    } catch (error) {
        console.error(error);
        renderPage(res, 'error', { error, url: "error" });
    }
});

// **Comparison Page**
app.get('/compare/:id1/:id2', async (req, res) => {
    try {
        const [user1, user2] = await Promise.all([
            userFunctions.user(req.params.id1),
            userFunctions.user(req.params.id2),
        ]);

        const history1 = (await userFunctions.history(req.params.id1)) || { history: [] };
        const history2 = (await userFunctions.history(req.params.id2)) || { history: [] };

        if (user1.success && user2.success) {
            renderPage(res, 'compare', {
                user1: user1.user,
                user2: user2.user,
                history1: history1.history,
                history2: history2.history,
                olderDate: Object.keys(history2.history).length > Object.keys(history1.history).length ? '2' : '1',
                url: `compare/${req.params.id1}/${req.params.id2}`
            });
        } else {
            renderPage(res, 'error', { error: user1.error || user2.error, url: "error" });
        }
    } catch (error) {
        console.error(error);
        renderPage(res, 'error', { error, url: "error" });
    }
});

// **Lists Page**
app.get('/lists/:type', (req, res) => {
    if (req.params.type === 'users') {
        renderPage(res, 'list', {
            total: channelCount,
            type: 'Users',
            options: [
                { "name": "Followers", "value": "followersCount" },
                { "name": "Posts", "value": "postsCount" },
                { "name": "Following", "value": "followsCount" },
                { "name": "Follower Gain (1D)", "value": "follower_gain_1" },
                { "name": "Post Gain (1D)", "value": "post_gain_1" },
                { "name": "Following Gain (1D)", "value": "following_gain_1" },
                { "name": "Follower Gain (7D)", "value": "follower_gain_7" },
                { "name": "Post Gain (7D)", "value": "post_gain_7" },
                { "name": "Following Gain (7D)", "value": "following_gain_7" },
                { "name": "Follower Gain (30D)", "value": "follower_gain_30" },
                { "name": "Post Gain (30D)", "value": "post_gain_30" },
                { "name": "Following Gain (30D)", "value": "following_gain_30" },
                { "name": "Display Name", "value": "displayName" },
                { "name": "Handle", "value": "handle" },
                { "name": "Date Joined", "value": "createdAt" }
            ],
            url: "lists/users"
        });
    } else {
        renderPage(res, 'error', { error: 'Invalid list type', url: "error" });
    }
});

// **API: Get All Data**
app.get('/api/data/all', (req, res) => {
    let data = db.getAll();
    if (req.query.min && req.query.max) {
        const min = parseInt(req.query.min);
        const max = parseInt(req.query.max);
        data = Object.fromEntries(Object.entries(data).filter(([key]) => key >= min && key <= max));
    }
    res.send(data);
});

let lastTop50 = 0;
let top50 = db.getTop50();

app.post('/api/top50', (req, res) => {
    res.send(top50);
    if (Date.now() - lastTop50 > 5000) {
        lastTop50 = Date.now();
        top50 = db.getTop50();
    }
});

// **Catch-All Route (404)**
app.get('*', (req, res) => renderPage(res, 'error', { error: '404 Not Found', url: "error" }));

// **Server Initialization**
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// **Update Users Periodically**
setInterval(async () => {
    const time = new Date();
    if (time.getHours() % 5 === 0 && time.getMinutes() === 0) {
        await updateAllUsers();
    }
}, 60000);

// **Initial Updates**
updateAllUsers(50);
setTimeout(() => updateAllUsers(50), 5000);

// **Graceful Shutdown**
process.on('SIGINT', () => {
    db.save();
    process.exit();
});