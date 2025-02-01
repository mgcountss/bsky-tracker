import puppeteer from 'puppeteer';
import { BskyAgent } from '@atproto/api';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

function convertDataURIToUint8Array(dataURI) {
    const base64 = dataURI.split(',')[1];
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

const waitForTimeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let futurePosts = [];
let makingPost = false;

const writeError = (error) => {
    fs.appendFile('./error.text', `${error}\n`, (err) => {
        if (err) {
            console.error('Failed to write error to error.log');
        }
    });
};

const makePost = async (fastest, milestone, milestoneCount, user) => {
    try {
        if (makingPost) {
            futurePosts.push({ fastest, milestone, milestoneCount, user });
            return;
        }
        makingPost = true;
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            protocolTimeout: 90000,
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 400 });

        if (milestone) {
            console.log(`Congratulations to ${user.handle} for reaching ${milestoneCount.toLocaleString()} followers! ${user.did}`);
            await page.goto(`http://localhost:3000/lists/users?force=${user.did}`);
            await page.waitForNetworkIdle();
            waitForTimeout(10000);

            const child = await page.$('#results > :nth-child(1)');
            if (child) {
                await child.screenshot({ path: `./screenshots/ms.png` });
            } else {
                console.log('No child found within .results at position 1');
                makingPost = false;
                if (futurePosts.length > 0) {
                    const nextPost = futurePosts.shift();
                    await makePost(nextPost.fastest, nextPost.milestone, nextPost.milestoneCount, nextPost.user);
                    writeError('No child found within .results at position 1');
                }
                return;
            }

            const agent = new BskyAgent({
                service: 'https://bsky.social',
            });

            await agent.login({
                identifier: process.env.BLUESKY_USERNAME,
                password: process.env.BLUESKY_PASSWORD,
            });

            const filePath = './screenshots/ms.png';
            const base64Data = fs.readFileSync(filePath, 'base64');
            const response = await agent.uploadBlob(
                convertDataURIToUint8Array(`data:image/png;base64,${base64Data}`),
                { encoding: 'image/png' }
            );

            if (!response.data.blob) {
                console.error('Failed to upload image ms.png');
                makingPost = false;
                if (futurePosts.length > 0) {
                    const nextPost = futurePosts.shift();
                    await makePost(nextPost.fastest, nextPost.milestone, nextPost.milestoneCount, nextPost.user);
                }
                writeError('Failed to upload image ms.png');
                return;
            }

            const postText = `Congratulations @${user.handle} for reaching ${milestoneCount.toLocaleString()} followers!`;
            const mentionStart = postText.indexOf(`@${user.handle}`);
            const mentionEnd = mentionStart + user.handle.length + 1;

            await agent.post({
                text: postText,
                facets: [
                    {
                        index: {
                            byteStart: mentionStart,
                            byteEnd: mentionEnd,
                        },
                        features: [
                            {
                                $type: 'app.bsky.richtext.facet#mention',
                                did: user.did,
                            },
                        ],
                    },
                ],
                embed: {
                    $type: 'app.bsky.embed.images',
                    images: [{
                        image: response.data.blob,
                        alt: `${user.handle} reached ${milestoneCount.toLocaleString()} followers!`
                    }]
                },
                createdAt: new Date().toISOString(),
            });

            console.log('Milestone post created successfully!');
            await browser.close();
        } else {
            await page.goto('http://bluesky.mgcounts.com/lists/users');
            await page.waitForNetworkIdle();
            waitForTimeout(10000);
            let text = "Most Followed";
            let text2 = "This is based off their total number of followers.";
            if (fastest) {
                await page.waitForSelector('#results');
                await page.select('#sort', 'follower_gain_24');
                await page.click('button');
                text = 'Fastest Growing';
                text2 = 'This is based off how many followers they have gained in the past 24 hours.';
                await page.waitForNetworkIdle();
                waitForTimeout(10000);
            }

            for (let i = 1; i < 5; i++) {
                const child = await page.$(`#results > :nth-child(${i})`);
                if (child) {
                    await child.screenshot({ path: `./screenshots/child${i}.png` });
                } else {
                    console.log(`No child found within .results at position ${i}`);
                }
            }

            const agent = new BskyAgent({
                service: 'https://bsky.social',
            });

            await agent.login({
                identifier: process.env.BLUESKY_USERNAME,
                password: process.env.BLUESKY_PASSWORD,
            });

            const images = [];
            for (let i = 1; i <= 4; i++) {
                const filePath = `./screenshots/child${i}.png`;
                const base64Data = fs.readFileSync(filePath, 'base64');
                const response = await agent.uploadBlob(
                    convertDataURIToUint8Array(`data:image/png;base64,${base64Data}`),
                    { encoding: 'image/png' }
                );
                if (!response.data.blob) {
                    console.error(`Failed to upload image child${i}.png`);
                    makingPost = false;
                    if (futurePosts.length > 0) {
                        const nextPost = futurePosts.shift();
                        await makePost(nextPost.fastest, nextPost.milestone, nextPost.milestoneCount, nextPost.user);
                    }
                    return;
                }

                images.push({
                    image: response.data.blob,
                    alt: `The ${i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : '4th'} ${text} BlueSky User`
                });
            }

            if (images.length === 0) {
                console.error('No images uploaded successfully, aborting post.');
                makingPost = false;
                if (futurePosts.length > 0) {
                    const nextPost = futurePosts.shift();
                    await makePost(nextPost.fastest, nextPost.milestone, nextPost.milestoneCount, nextPost.user);
                }
                writeError('No images uploaded successfully, aborting post.');
                return;
            }

            await agent.post({
                text: `The 4 ${text} Blue Sky Users as of ${new Date().toLocaleString().toString().split(',')[0]}!

${text2}

Source: https://www.bsky-tracker.xyz/lists/users`,
                embed: {
                    $type: 'app.bsky.embed.images',
                    images
                },
                createdAt: new Date().toISOString(),
            });

            console.log('Post created successfully!');
            await browser.close();
        }

        makingPost = false;
        if (futurePosts.length > 0) {
            const nextPost = futurePosts.shift();
            await makePost(nextPost.fastest, nextPost.milestone, nextPost.milestoneCount, nextPost.user);
        }
        return;
    } catch (error) {
        console.error(error);
        makingPost = false;
        if (futurePosts.length > 0) {
            const nextPost = futurePosts.shift();
            await makePost(nextPost.fastest, nextPost.milestone, nextPost.milestoneCount, nextPost.user);
        }
        writeError(error);
        try {
            await browser.close();
        } catch (error) {
            console.error(error);
        }
        return;
    }
};

export default makePost;
