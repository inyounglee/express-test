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
const cors = require('cors');

app.use(cors());
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

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

mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

const Schema = mongoose.Schema;

let productSchema = new Schema({
    name: {
        type: String,
        required: true,
        max: 100
    },
    price: {
        type: Number,
        required: true
    },
});

let Product = mongoose.model('Product', productSchema);
var productNumber = 1;

app.post('/product_create', (req, res) => {
    let product = new Product({
        name: `Iphone X (${productNumber})`,
        price: 1000000
    });
    productNumber++;

    product.save((err) => {
        if (err) {
            return next(err);
        }
        res.send('Product Created successfully');
    });
});

app.get('/product_list', (req, res) => {
    Product.find({}, (err, docs) => {
        res.send(docs);
    });
    //.forEach((value, index, arr) => { res.write(value); }); });
});

app.post('/quotes', (req, res) => {
    console.log(req.body);
});

/*
{
    transaction: {
        client_ip: '127.0.0.1',
        time_stamp: 'Tue May 14 17:23:31 2019',
        server_id: '982086ab73fff911dd5d2857ad3092e91c5d5f50',
        client_port: 59518,
        host_ip: '127.0.0.1',
        host_port: 8080,
        id: '155782221166.418369',
        request: {
            method: 'GET',
            http_version: 1.1,
            uri: '/index.html?test=g4_path',
            headers: [Object]
        },
        response: {
            http_code: 403,
            headers: [Object]
        },
        producer: {
            modsecurity: 'ModSecurity v3.0.2 (Linux)',
            connector: 'iwafmsc v1.0.0',
            secrules_engine: 'Enabled',
            components: [Array]
        },
        messages: [
            [Object]
        ]
    }
}
*/
let auditlogSchema = new Schema({
    transaction: {
        client_ip: {
            type: 'String'
        },
        time_stamp: {
            type: 'Date'
        },
        server_id: {
            type: 'String'
        },
        client_port: {
            type: 'Number'
        },
        host_ip: {
            type: 'String'
        },
        host_port: {
            type: 'Number'
        },
        id: {
            type: 'String'
        },
        request: {
            method: {
                type: 'String'
            },
            http_version: {
                type: 'Number'
            },
            uri: {
                type: 'String'
            },
            headers: {
                type: [
                    'Mixed'
                ]
            }
        },
        response: {
            http_code: {
                type: 'Number'
            },
            headers: {
                type: [
                    'Mixed'
                ]
            }
        },
        producer: {
            modsecurity: {
                type: 'String'
            },
            connector: {
                type: 'String'
            },
            secrules_engine: {
                type: 'String'
            },
            components: {
                type: [
                    'Mixed'
                ]
            }
        },
        messages: {
            type: [
                'Array'
            ]
        }
    }
});

/*
app.post('/auditlog', (req, res) => {
    console.log(req.body);
    console.log(req.body.transaction.request.headers);
    for (let i=0; i<req.body.transaction.request.headers.length; i++)
        console.log(req.body.transaction.request.headers[i]);
});
*/

let AuditLog = mongoose.model('AuditLog', auditlogSchema);

app.post('/auditlog', (req, res) => {
    let auditlog = new AuditLog(req.body);

    auditlog.save((err) => {
        if (err) {
            return next(err);
        }
        res.send('AuditLog inserted successfully');
    });
});

app.get('/auditlog', (req, res) => {
    /*
    let auditlogs = [{
        'srcip': '52.65.210.100',
        'srccname': '대한민국',
        'srccn': 'KR',
        'srccicon': '/images/flags/kr.png',
        'destip': '82.55.250.90',
        'desthost': 'www.f1security.co.kr',
        'datetime': '2018-12-13 13:50:00',
        'method': 'GET',
        'path': '/login',
        'querystring': 'id=yourname&passwd=1234',
        'act': '탐지',
        'ruleid': '942100',
        'severity': 'CRITICAL',
        'ver': 'OWASP_CRS/3.0.0',
        'accuracy': '8',
        'tag': 'SQL인젝션',
        'message': 'SQL Injection Attack Detected via libinjection',
        'httpheader': '',
        'httpbody': ''
    }];
    res.send(auditlogs);
    */

    let auditlogs = [];
    AuditLog.find({}, (err, docs) => {
        docs.forEach((value) => {
            /*
            console.log(value);
            console.log(value.transaction.messages);
            console.log(value.transaction.messages[0]);
            console.log(value.transaction.messages[0][0]);
            */
            auditlogs.push({
                'srcip': value.transaction.client_ip,
                'srccname': '대한민국',
                'srccn': 'KR',
                'srccicon': '/images/flags/kr.png',
                'destip': value.transaction.host_ip,
                'desthost': value.transaction.request.headers[0].Host,
                'datetime': value.transaction.time_stamp,
                'method': value.transaction.request.method,
                'path': value.transaction.request.uri,
                'querystring': '',
                'act': '탐지',
                'ruleid': value.transaction.messages[0][0].details.ruleId,
                'severity': 'CRITICAL',
                'ver': value.transaction.producer.components[0],
                'accuracy': value.transaction.messages[0][0].details.accuracy,
                'tag': value.transaction.messages[0][0].details.tags[0],
                'message': value.transaction.messages[0][0].message,
                'httpheader': '',
                'httpbody': ''
            });
        });
        res.send(auditlogs);
    }).sort({"transaction.time_stamp":-1});
});