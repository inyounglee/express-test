const express = require('express');
const router = express.Router();

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

router.get('/', (req, res) => {
    return res.json(users);
});

router.get('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
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

router.post('/', (req, res) => {
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

module.exports = router;