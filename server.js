var Cesium = require('cesium')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const ejs = require('ejs')
const port = process.env.PORT || 3000
const elasticsearch = require('elasticsearch')

app.set('view engine', 'ejs')

var es = new elasticsearch.Client({
  host: process.env.ES_URL || 'http://localhost:9200',
  httpAuth: process.env.ES_HTTP_AUTH || ''
});

es.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 3000
}, function (error) {
  if (error) {
    console.trace('ElasticSearch cluster is down!');
    process.exit(1); 
  } else {
    console.log('ElasticSearch cluster is reachable.');
  }
});

// create application/json parser
var jsonParser = bodyParser.json()

app.use('/Build', express.static('node_modules/cesium/Build'))
app.use('/models', express.static('models'))

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/recent/:index/:type/:fromtime/:totime', function (req, res) {
  if(req.params) {
    var index = req.params.index
    var type = req.params.type
    var fromtime = req.params.fromtime
    var totime = req.params.totime
    var query = {
      index: `${index}*`,
      type: type,
      body: {
        query: {
	  range: {
            timestamp: {
              gte: `${fromtime}`,
              lt: `${totime}`
            }
          }
        }
      }
    }
    data = es.search(query).then(function (resp) {
      var hits = (resp.hits && resp.hits.hits.length) || 0;
      console.log(`GET /recent/${index}/${type}/${fromtime}/${totime} - ${hits} hits`)
//      console.log(JSON.stringify(resp.hits.hits,null,2))
      res.status(200).json({ success: true, hits: hits, result: resp })
    }, function (err) {
      if(err) {
        console.trace(err.message);
      }
    })
  } else {
    console.log(`GET /es/${index}/${type} - Missing parameters`)
    res.status(404).json({ success: false, message: "Missing parameters" })
  }
})

app.post('/', jsonParser, (req, res) => {
  console.log('POST /')
  console.log(req.body)
  res.status(200).json({ success: true })
})

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
