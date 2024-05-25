const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 4002;

const posts = {};

// example of a post object
// posts ==={
//     '123': {
//         id: '123',
//         title: 'post title',
//         comments: [
//             {id: '456', content: 'comment content'}
//         ]
//     }
// }

const handleEvent = (type, data) => {
    if (type === 'CommentCreated') {
        const {id, content, postId, status} = data;
        const post = posts[postId];
        post.comments.push({id, content, status});
    }
    if (type === 'PostCreated') {
        const {id, title} = data;
        posts[id] = {id, title, comments: []};
    }
    if (type === 'CommentUpdated') {
        const {id, postId, status, content} = data;
        const post = posts[postId];
        const comment = post.comments.find(comment => comment.id === id);
        comment.status = status;
        comment.content = content;
    }
}

// app.get('/posts' , (req, res) => {
//     res.send(posts);
// });

app.post('/events', (req, res) => {
    const {type, data} = req.body;
    handleEvent(type, data);
    console.log(posts);
    res.send({status: 'OK'});
});

app.listen(port, async() => {
    console.log(`Query service listening at http://localhost:${port}`);
    try {
        const res = await axios.get('http://event-bus-srv:4005/events');
        for (let event of res.data) {
            console.log('Processing event:', event.type);
            handleEvent(event.type, event.data);
        }
    } catch (error) {
        console.log(error);
    }

});