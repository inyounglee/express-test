const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded());
//app.use('/users', require('./api/users'));

app.get('/', (req, res) => {
    console.log('params', req.params);
    console.log('query', req.query);
    console.log('body', req.body);
    res.send('Hello World!\n');
});

/**
 * 아래의 결과는 다음과 같이 출력된다.
 * 
 * path /info/2
 * params
 * Object {id: "2"}
 * query
 * Object {testparam: "test", testparam2: "test2", testparam3: "test3"}
 * body
 * Object {testparam: "test", id: "1 = '1' / * "blah" * /  OR 1"}
 */
app.post('/info/:id', (req, res) => {
    console.log('path', req.path);
    console.log('params', req.params); /** 처음 접하면 당연히 java getParameter로 이해하겠지만 실제는 path param이다. */
    console.log('query', req.query);
    console.log('body', req.body); /** bodyParser를 등록해야 한다. */
    res.send('POST Hello World!\n');
});

let users = [{
        id: 1,
        name: 'alice'
    },
    {
        id: 2,
        name: 'bek'
    },
    {
        id: 3,
        name: 'chris'
    }
];

app.get('/users', (req, res) => {
    return res.json(users);
});

app.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) {
        return res.status(400).json({
            error: 'Incorrect id'
        });
    }
    let user = users.filter(user => user.id === id)[0]
    console.log(user); // {id: 1, name: 'alice'}
    if (!user) {
        return res.status(404).json({
            error: 'Unknown user'
        });
    }
    return res.json(user);
});

app.delete('/users/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) {
        return res.status(400).json({
            error: 'Incorrect id'
        });
    }

    const userIdx = users.findIndex(user => user.id === id);
    if (userIdx === -1) {
        return res.status(404).json({
            error: 'Unknown user'
        });
    }

    users.splice(userIdx, 1);
    res.status(204).send();
});

app.post('/users', (req, res) => {
    const name = req.body.name || '';
    if (!name.length) {
        return res.status(400).json({
            error: 'Incorrenct name'
        });
    }
    const id = users.reduce((maxId, user) => {
        return user.id > maxId ? user.id : maxId
    }, 0);
    let intid = parseInt(id, 10);
    intid ++;

    const newUser = {
        id: intid,
        name: name
    };
    return res.status(201).json(newUser);
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});