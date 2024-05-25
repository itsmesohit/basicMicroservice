const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto');
const cors = require('cors');
const app = express();

app.use(cors());

app.use(bodyParser.json());

const port = 4000;

const posts = {};

app.get('/posts', (req, res) => {
    res.send(posts);
});


app.post('/posts/create', async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const {title} = req.body;
    posts[id] = {
        id, title
    };
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: {
            id, title
        }
    }).catch(err => console.log(err));
    res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
    console.log('Received Event', req.body.type);
    res.send({status: 'OK'});
});

app.listen(port, () =>{
    console.log("this is the old version");
    console.log("v55")
    console.log(`Example app listening on port ${port}!`)
})