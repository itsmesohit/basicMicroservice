const express = require('express');
const axios = require('axios');
const app = express();
const {randomBytes} = require('crypto');
const cors = require('cors');
const port = 4001;

app.use(express.json());
app.use(cors());

const commentsByPostId = {
    '123': [
        {id: '123', content: 'Hello', status: 'approved'},
        {id: '123', content: 'World', status: 'rejected'},
    ],
    '456': [
        {id: '456', content: 'Hello'},
    ]
};

app.get('/posts/:id/comments', (req, res) => {
    const id = req.params.id;
    res.send(commentsByPostId[id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const {content} = req.body;
    const {id } = req.params;
    const commentsId = randomBytes(4).toString('hex');
    const comments = commentsByPostId[id] || [];
    comments.push({id: commentsId, content, status: 'pending'});
    commentsByPostId[id] = comments;
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentsId,
            content,
            postId: id,
            status: 'pending'
        }
    }).catch(err => console.log(err));
    res.status(201).send(comments);

});

app.post('/events', async(req, res) => {
    console.log('Received Event', req.body.type);

    const {type, data} = req.body;
    if (type === 'CommentModerated') {
        const {id, postId, status, content} = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => comment.id === id);
        comment.status = status;
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        }).catch(err => console.log(err));
        
    }
    res.send({status: 'OK'});
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))