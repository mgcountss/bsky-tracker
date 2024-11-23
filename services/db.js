import fs from "fs";
import makePost from "./makePost.js";
const db = JSON.parse(fs.readFileSync("./database/db.json", "utf8"));

const get = (id) => {
    return db[id];
};

const del = (id) => {
    delete db[id];
};

const has = (id) => {
    return !!db[id];
};

const sortData = (key, order, start, end) => {
    try {
        let newDB = [...Object.entries(db)];
        if (key === "handle" || key === "displayName") {
            const sortedData = newDB.sort((a, b) => {
                const valueA = a[1][key];
                const valueB = b[1][key];
                if (order === "asc") {
                    return valueA.localeCompare(valueB);
                } else if (order === "desc") {
                    return valueB.localeCompare(valueA);
                } else {
                    throw new Error('Invalid order specified. Use "asc" or "desc".');
                }
            });

            return sortedData.slice(start, end);
        } else if (key == "follower_gain_7" || key == "post_gain_7" || key == "following_gain_7" || key == "follower_gain_24" || key == "post_gain_24" || key == "following_gain_24") {
            let newDB = JSON.parse(JSON.stringify(db));
            let date = new Date();
            date.setDate(date.getDate() - 1);
            if (key.includes("7")) {
                date.setDate(date.getDate() - 6);
            }
            let dateStr = date.toISOString().split("T")[0];
            let todayDateStr = new Date().toISOString().split("T")[0];

            for (let key in newDB) {
                try {
                    let user = newDB[key];
                    let daily = user.daily;
                    if (!daily) {
                        continue;
                    }
                    let today = daily[todayDateStr];
                    if (!today) {
                        let keys = Object.keys(daily);
                        today = daily[keys[keys.length - 1]];
                    }
                    let daysAgo = daily[dateStr];
                    if (!daysAgo) {
                        let keys = Object.keys(daily);
                        daysAgo = daily[keys[0]];
                    }
                    user.gained = {
                        followersCount: today.followersCount - daysAgo.followersCount,
                        postsCount: today.postsCount - daysAgo.postsCount,
                        followsCount: today.followsCount - daysAgo.followsCount
                    };
                } catch (error) {
                    console.log(error);
                }
            };
            let users = Object.entries(newDB);
            let sorted;

            if (key.includes("follower")) {
                sorted = users.sort((a, b) => {
                    if (b[1] && a[1] && b[1].gained && a[1].gained) {
                        return b[1].gained.followersCount - a[1].gained.followersCount;
                    } else {
                        return 0;
                    }
                });
            } else if (key.includes("post")) {
                sorted = users.sort((a, b) => {
                    if (b[1] && a[1] && b[1].gained && a[1].gained) {
                        return b[1].gained.postsCount - a[1].gained.postsCount;
                    } else {
                        return 0;
                    }
                });
            } else if (key.includes("following")) {
                sorted = users.sort((a, b) => {
                    if (b[1] && a[1] && b[1].gained && a[1].gained) {
                        return b[1].gained.followsCount - a[1].gained.followsCount;
                    } else {
                        return 0;
                    }
                });
            }
            let data = sorted.slice(start, end);
            return data;
        } else {
            let newData = newDB.sort((a, b) => {
                if (order === "asc") {
                    return parseInt(a[1][key]) - parseInt(b[1][key]);
                } else {
                    return parseInt(b[1][key]) - parseInt(a[1][key]);
                }
            }).slice(start, end);
            return newData;
        }
    } catch (error) {
        console.log(error);
    }
};

const milestoneDetector = (start, end) => {
    const milestones = [];

    if (end >= 1000000) {
        const startMillion = Math.floor(start / 1000000);
        const endMillion = Math.floor(end / 1000000);

        for (let million = startMillion + 1; million <= endMillion; million++) {
            milestones.push(million * 1000000);
        }
    }

    if (end < 1000000) {
        const sixDigitMilestones = [100000, 250000, 500000, 750000];

        for (const milestone of sixDigitMilestones) {
            if (start < milestone && end >= milestone) {
                milestones.push(milestone);
            }
        }
    }
    
    return { number: milestones[milestones.length - 1] };
};

const ensure = (id, value) => {
    let milestone = {
        happen: false,
        number: null,
        user: null
    };
    if (!db[id]) {
        db[id] = value;
    } else {
        for (const key in value) {
            db[id][key] = value[key];
        }
        if (!db[id].daily) {
            db[id].daily = {};
        }

        if (db[id].daily[`${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`]) {
            let ms = db[id].followersCount;
            let lastCount = db[id].daily[`${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`].followersCount;
            let msD = milestoneDetector(lastCount, ms);
            if (msD.number) {
                if (lastCount < msD.number && msD.number <= ms) {
                    milestone.happen = true;
                    milestone.number = msD.number;
                    milestone.user = db[id];
                }
            }
        }
        let date = new Date();
        date.setDate(date.getDate() - 1);
        let dateStr = date.toISOString().split("T")[0];
        let yesterday = db[id].daily[dateStr];
        if (yesterday) {
            let ms = db[id].followersCount;
            let lastCount = yesterday.followersCount;
            let msD = milestoneDetector(lastCount, ms);
            if (msD.number) {
                if (lastCount < msD.number && msD.number <= ms) {
                    milestone.happen = true;
                    milestone.number = msD.number;
                    milestone.user = db[id];
                }
            }
        }

        db[id].daily[`${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`] = {
            followersCount: db[id].followersCount,
            postsCount: db[id].postsCount,
            followsCount: db[id].followsCount,
            updatedAt: db[id].updated_at
        };
        db[id].updated_at = Date.now();

        if (milestone.happen) {
            console.log("Milestone detected");
            makePost(false, true, milestone.number, milestone.user);
        }
    }
};

const keys = () => {
    const db = JSON.parse(fs.readFileSync("./database/db.json", "utf8"));
    return Object.keys(db);
};

const all = () => {
    return db;
};

const getTheChannels = () => {
    let keys = Object.keys(db);
    let thisDB = JSON.parse(JSON.stringify(db));
    let mostFollowed = thisDB[keys[0]];
    let mostPosts = thisDB[keys[0]];
    let mostFollowing = thisDB[keys[0]];
    let newest = thisDB[keys[0]];
    let random = thisDB[keys[0]];
    let us = thisDB["did:plc:koxi6wd6ji7g7kvbwrhvrtbx"];
    for (let i = 1; i < keys.length; i++) {
        if (!thisDB[keys[i]]) {
            continue;
        }
        if (thisDB[keys[i]].followersCount > mostFollowed.followersCount) {
            mostFollowed = thisDB[keys[i]];
        }
        if (thisDB[keys[i]].postsCount > mostPosts.postsCount) {
            mostPosts = thisDB[keys[i]];
        }
        if (thisDB[keys[i]].followsCount > mostFollowing.followsCount) {
            mostFollowing = thisDB[keys[i]];
        }
        if (thisDB[keys[i]].createdAt > newest.createdAt) {
            newest = thisDB[keys[i]];
        }
    }
    random = thisDB[keys[Math.floor(Math.random() * keys.length)]];
    mostFollowed.label = "Most Followed";
    mostFollowed.thing = "followersCount";
    mostFollowed.thing_label = "followers";
    random.label = "Random User";
    random.thing = "followersCount";
    random.thing_label = "followers";
    mostPosts.label = "Most Posts";
    mostPosts.thing = "postsCount";
    mostPosts.thing_label = "posts";
    mostFollowing.label = "Most Following";
    mostFollowing.thing = "followsCount";
    mostFollowing.thing_label = "following";
    newest.label = "Newest User";
    newest.thing = "followersCount";
    newest.thing_label = "followers";
    us.label = "Our Account"
    us.thing = "followersCount";
    us.thing_label = "followers";
    return [mostFollowed, mostPosts, mostFollowing, newest, random, us];
};

const save = () => {
    fs.writeFileSync("./database/db.json", JSON.stringify(db, {}));
};

const getAll = () => {
    return db;
}

setInterval(() => {
    fs.writeFileSync("./database/db.json", JSON.stringify(db, {}));
}, 60000);

setInterval(() => {
    fs.writeFileSync("./database/backups/" + Date.now() + ".json", JSON.stringify(db, {}));
}, 1000 * 60 * 60 * 1);

export default {
    get,
    has,
    ensure,
    keys,
    delete: del,
    all,
    save,
    sortData,
    getTheChannels,
    getAll
};