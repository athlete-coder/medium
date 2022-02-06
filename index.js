import fetch from 'node-fetch';
import fs from 'fs';
import express from 'express';
import path from "path";
import cron from 'cron';

const CronJob = cron.CronJob;
const app = express();

const postDir = "./posts.json"

async function getMediumPosts(username) {
    //username must start with @
    if (typeof username !== 'string' || !username.startsWith('@')) throw Error("Invalid username");

    const url = "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/" + username;

    return fetch(url)
        .then((res) => res.json())
        .then((data) => data.items)
}

async function storePosts(posts) {
    return new Promise((resolve, reject) => {
        fs.writeFile(postDir, JSON.stringify(posts), 'utf-8', (err, data) => {
            if (err) {
                reject("Failed to create json file");
            } else {
                resolve('success')
            }
        })
    })
}

async function processPosts() {
    const posts = await getMediumPosts('@athletecoder');
    await storePosts(posts)
}

async function getPosts() {
    return new Promise((resolve, reject) => {
        fs.readFile(postDir, 'utf-8', (err, data) => {
            if (err || !data) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

const job = new CronJob(
    '00 00 * * *', //run every day at midnight
    () => {
        processPosts()
            .catch((err) => {
                //stop job if error occurs
                //maybe send yourself a text or email
                console.log(err)
                job.stop()
            })
    },
    null,
    true //boolean to auto start after init
)


app.get('/api/posts/get', async (req, res) => {
    return getPosts()
        .then((posts) => {
            res.send(posts)
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).send("Failed to get posts")
        })

})

const root = path.resolve('./client');
app.use(express.static(root));

app.get('*', (req, res) => {
    res.sendFile('index.html', { root });
})


app.listen(3000, () => {
    console.log('listening on port 3000')
})