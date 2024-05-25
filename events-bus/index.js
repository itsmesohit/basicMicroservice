const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.json());
const port = 4005;

const events = [];

app.post('/events', async (req, res) => {
    const event = req.body;

    events.push(event);


    await axios.post('http://posts-clusterip-srv:4000/events', event).catch(err => console.log(err));
    await axios.post('http://comments-srv:4001/events', event).catch(err => console.log(err));
    await axios.post('http://query-srv:4002/events', event).catch(err => console.log(err));
    await axios.post('http://moderation-srv:4003/events', event).catch(err => console.log(err));
    res.send({status: 'OK'});
});
app.get('/events', (req, res) => {
    res.send(events);
});

app.listen(port, () => {
    console.log(`Event bus listening at http://localhost:${port}`)
});