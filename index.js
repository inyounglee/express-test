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

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});

// changes for master branch