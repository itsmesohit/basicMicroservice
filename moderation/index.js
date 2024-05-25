const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const port = 4003;

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
    const {type, data} = req.body;
    if (type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved';
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentModerated',
            data: {
                id: data.id,
                content: data.content,
                postId: data.postId,
                status
            }
        }).catch(err => console.log(err));
    }
});

app.listen(port, () => {
    console.log(`Event bus listening at http://localhost:${port}`)
});


