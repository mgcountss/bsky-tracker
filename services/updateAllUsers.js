import fetch from 'node-fetch';
import db from './db.js';

async function updateAllUsers() {
    let allUserIds = db.keys();
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
};

export default updateAllUsers;
export { updateAllUsers };