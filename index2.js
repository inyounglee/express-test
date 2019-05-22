const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded());
app.use('/users', require('./api/users'));

app.get('/', (req, res) => {
    console.log('params', req.params);
    console.log('query', req.query);
    console.log('body', req.body);
    res.send('Hello World!\n');
});


