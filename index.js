const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const Influx = require('influx');
const hanalei = require('./data/tides-hanalei.js');
const hilo = require('./data/tides-hilo.js');
const honolulu = require('./data/tides-honolulu.js');
const kahului = require('./data/tides-kahului.js');

const mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/users', require('./api/users'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', 3000);

app.get('/', (req, res) => {
    console.log('params', req.params);
    console.log('query', req.query);
    console.log('body', req.body);
    res.send('Hello World! (on nodemon)\n');
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

/*
 * influx database를 체크한 이후 서버를 구동할 수 있도록 해당 코드영역으로 이전
 *
app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
*/

// changes for influxdb
// $ npm install --save influx
// $ yarn add influx
// 예제 구현) 링크: https://www.influxdata.com/blog/getting-started-with-node-influx/
// 소스 경로: https://github.com/mschae16/node-influx-highcharts-sample
// 참조: node-influx
// https://node-influx.github.io/manual/tutorial.html
// https://node-influx.github.io/

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'ocean_tides',
    schema: [{
        measurement: 'tide',
        fields: {
            height: Influx.FieldType.FLOAT
        },
        tags: ['unit', 'location']
    }]
});

const writeDataToInflux = (locationObj) => {
    locationObj.rawtide.rawTideObs.forEach(tidePoint => {
        influx.writePoints([{
                measurement: 'tide',
                tags: {
                    unit: locationObj.rawtide.tideInfo[0].units,
                    location: locationObj.rawtide.tideInfo[0].tideSite,
                },
                fields: {
                    height: tidePoint.height
                },
                timestamp: tidePoint.epoch,
            }], {
                database: 'ocean_tides',
                precision: 's',
            })
            .catch(error => {
                console.error(`Error saving data to InfluxDB! ${err.stack}`);
            });
    });
};

influx.getDatabaseNames()
    .then(names => {
        if (!names.includes('ocean_tides')) {
            return influx.createDatabase('ocean_tides');
        }
    })
    .then(() => {
        app.listen(3000, () => {
            console.log('Listening on port 3000!');
        });
    })
    .catch(error => console.log({
        error
    }));

app.get('/influxdb/write/init', (req, res) => {
    writeDataToInflux(hanalei);
    writeDataToInflux(hilo);
    writeDataToInflux(honolulu);
    writeDataToInflux(kahului);
});

app.get('/api/v1/tide/:place', (request, response) => {
    const {
        place
    } = request.params;
    console.log('place = ' + place);
    // 아래의 ${place}는 ECMAScript 2015 template literals 규격을 사용해야 문자열에 추가된다.
    var query = `select * from tide
    where location =~ /(?i)(${place})/`;
    //var query = 'select * from tide where location =~ /(?i)('+place+')/';
    console.log('query = [' + query + ']');
    influx.query(query)
        .then(result => response.status(200).json(result))
        .catch(error => response.status(500).json({
            error
        }));
});


/*********************************************************************************/
// mongodb-test
/*********************************************************************************/

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

app.post('/quotes', (req, res) => {
    console.log(req.body);
});
