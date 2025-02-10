import fs from "fs";
import updateAllUsers from "./updateAllUsers.js";
let db = JSON.parse(fs.readFileSync("./database/db.json", "utf8"));

const get = (id) => {
    return db[id];
};

const has = (id) => {
    return !!db[id];
};

const calculateAgo = (days) => {
    let date = new Date();
    date.setDate(date.getDate() - days);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

const sortData = (key, order, start, end) => {
    try {
        let entries = Object.entries(db);

        if (key === "handle" || key === "displayName") {
            return entries
                .sort((a, b) => order === "asc" ? a[1][key].localeCompare(b[1][key]) : b[1][key].localeCompare(a[1][key]))
                .slice(start, end);
        }

        if (key.includes("gain_7") || key.includes("gain_1") || key.includes("gain_30")) {
            const daysAgo = key.includes("7") ? 7 : key.includes("1") ? 1 : 30;
            const todayDateStr = calculateAgo(0);

            for (let [_, user] of entries) {
                let daily = user.daily;
                if (!daily) continue;

                let today = daily[todayDateStr] || daily[Object.keys(daily).pop()];
                let past = daily[calculateAgo(daysAgo)] || daily[Object.keys(daily)[0]];
                if (!today || !past) continue;
                user.gained = {
                    followersCount: today.followersCount - past.followersCount,
                    postsCount: today.postsCount - past.postsCount,
                    followsCount: today.followsCount - past.followsCount
                };
            }

            const gainKey = key.includes("follower") ? "followersCount"
                : key.includes("post") ? "postsCount"
                : "followsCount";
            return entries
                .filter(([_, user]) => user.gained)
                .sort((a, b) => (b[1].gained[gainKey] || 0) - (a[1].gained[gainKey] || 0))
                .slice(start, end);
        }

        return entries
            .sort((a, b) => order === "asc" 
                ? (parseInt(a[1][key]) || 0) - (parseInt(b[1][key]) || 0)
                : (parseInt(b[1][key]) || 0) - (parseInt(a[1][key]) || 0))
            .slice(start, end);
    } catch (error) {
        console.error(error);
        return [];
    }
};

const milestoneDetector = (start, end) => {
    const milestones = [];
    if (start < 1000000) {
        const sixDigitMilestones = [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000];
        for (const milestone of sixDigitMilestones) {
            if (start < milestone && end >= milestone) {
                milestones.push(milestone);
            }
        }
    }
    if (end >= 1000000) {
        const startMillion = Math.floor(start / 1000000);
        const endMillion = Math.floor(end / 1000000);

        for (let million = startMillion + 1; million <= endMillion; million++) {
            milestones.push(million * 1000000);
        }
    }
    return { number: milestones.length > 0 ? milestones[milestones.length - 1] : null };
};

const ensure = (id, value) => {
    const user = db[id] ??= value; // Use nullish assignment for initialization
    Object.assign(user, value); // Merge properties efficiently

    const todayDateStr = calculateAgo(0);
    const yesterdayDateStr = calculateAgo(1);

    user.daily ??= {}; // Ensure `daily` object exists

    let milestone = { happen: false, number: null, user: null };
    const checkMilestone = (lastCount, currentCount) => {
        const msD = milestoneDetector(lastCount, currentCount);
        if (msD.number && lastCount < msD.number && msD.number <= currentCount) {
            milestone = { happen: true, number: msD.number, user };
        }
    };

    if (user.daily[todayDateStr]) {
        checkMilestone(user.daily[todayDateStr].followersCount, user.followersCount);
    }

    if (!milestone.happen && user.daily[yesterdayDateStr]) {
        checkMilestone(user.daily[yesterdayDateStr].followersCount, user.followersCount);
    }

    user.daily[todayDateStr] = {
        followersCount: user.followersCount,
        postsCount: user.postsCount,
        followsCount: user.followsCount,
        updatedAt: user.updated_at
    };
    
    user.updated_at = Date.now();

    if (milestone.happen && milestone.number !== user.lastMilestone) {
        user.lastMilestone = milestone.number;
        console.log("Milestone detected", milestone.number, user.handle);
        // makePost(false, true, milestone.number, user);
    }
};

const keys = (where) => {
    if (where) {
        let keys = Object.keys(db);
        let newKeys = [];
        for (let i = 0; i < keys.length; i++) {
            if (where.where(db[keys[i]])) {
                newKeys.push(keys[i]);
            }
        }
        return newKeys;
    } else {
        const db = JSON.parse(fs.readFileSync("./database/db.json", "utf8"));
        return Object.keys(db);
    }
};

const all = () => {
    return db;
};

const getTheChannels = () => {
    const keys = Object.keys(db);
    if (keys.length === 0) return [];

    const us = db["did:plc:koxi6wd6ji7g7kvbwrhvrtbx"];

    let mostFollowed = db[keys[0]];
    let mostPosts = db[keys[0]];
    let mostFollowing = db[keys[0]];
    let newest = db[keys[0]];

    for (const key of keys) {
        const user = db[key];
        if (!user) continue;

        if (user.followersCount > mostFollowed.followersCount) mostFollowed = user;
        if (user.postsCount > mostPosts.postsCount) mostPosts = user;
        if (user.followsCount > mostFollowing.followsCount) mostFollowing = user;
        if (user.createdAt > newest.createdAt) newest = user;
    }

    const random = db[keys[Math.floor(Math.random() * keys.length)]];

    const setLabels = (user, label, thing, thingLabel) => {
        if (user) {
            user.label = label;
            user.thing = thing;
            user.thing_label = thingLabel;
        }
    };

    setLabels(mostFollowed, "Most Followed", "followersCount", "followers");
    setLabels(mostPosts, "Most Posts", "postsCount", "posts");
    setLabels(mostFollowing, "Most Following", "followsCount", "following");
    setLabels(newest, "Newest User", "followersCount", "followers");
    setLabels(random, "Random User", "followersCount", "followers");
    setLabels(us, "Our Account", "followersCount", "followers");

    return [mostFollowed, mostPosts, mostFollowing, newest, random, us].filter(Boolean);
};


let top50IdsLol = [];

function setTop50() {
    const sorted = Object.entries(db)
        .sort((a, b) => b[1].followersCount - a[1].followersCount)
        .slice(0, 50)
        .map(([id]) => id);
    top50IdsLol = sorted;
}

setTop50();
setInterval(setTop50, 3.6e6);

const getTop50 = (onlyReturnIdsFromMainDb) => {
    if (onlyReturnIdsFromMainDb) return top50IdsLol;
    updateAllUsers(51);
    return top50IdsLol.map((id) => {
        const user = db[id];
        return {
            did: user.did,
            followersCount: user.followersCount,
            displayName: user.displayName,
            avatar: user.avatar,
        };
    });
};

const getAll = () => {
    return db;
}

setInterval(() => {
    fs.writeFileSync("./database/db.json", JSON.stringify(db), "utf8");
}, 600000);

setInterval(() => {
    fs.writeFileSync(`./database/backups/db_backup_${Date.now()}.json`, JSON.stringify(db), "utf8");
}, 1000 * 60 * 60 * 12);

export default {
    get,
    has,
    ensure,
    keys,
    all,
    sortData,
    getTheChannels,
    getAll,
    getTop50,
    save: () => {
        fs.writeFileSync("./database/db.json", JSON.stringify(db), "utf8");
    }
};