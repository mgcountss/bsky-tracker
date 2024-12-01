import fetch from 'node-fetch';
import db from './db.js';

async function updateAllUsers(num) {
    if (num) {
        let top50 = db.getTop50();
        let allUserIds = top50.map((user) => user[0]);
        let groups = [];
        let group = [];
        for (let i = 0; i < allUserIds.length; i++) {
            group.push(allUserIds[i]);
            if (group.length === 25) {
                groups.push(group);
                group = [];
            }
        }
        if (group.length > 0) {
            groups.push(group);
        }
        for (let i = 0; i < groups.length; i++) {
            let response = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfiles?actors=${groups[i].join("&actors=")}`);
            let json = await response.json();
            json.profiles.forEach((profile) => {
                db.ensure(profile.did, profile);
            });
        }
    } else {
        let allUserIds = db.keys({
            'where': (user) => !user.updated_at || user.updated_at < Date.now() - 24 * 60 * 60 * 1000
        });
        let completed = 0;
        let total = allUserIds.length;
        console.log('Updating', total, 'users');
        let groups = [];
        let group = [];
        for (let i = 0; i < allUserIds.length; i++) {
            group.push(allUserIds[i]);
            if (group.length === 25) {
                groups.push(group);
                group = [];
            }
        }
        if (group.length > 0) {
            groups.push(group);
        }

        for (let i = 0; i < groups.length; i++) {
            let response = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfiles?actors=${groups[i].join("&actors=")}`);
            let json = await response.json();
            json.profiles.forEach((profile) => {
                db.ensure(profile.did, profile);
            });
            completed += groups[i].length;
            console.log('Updated', completed, 'of', total, 'users');
        }
    }
};

export default updateAllUsers;
export { updateAllUsers };