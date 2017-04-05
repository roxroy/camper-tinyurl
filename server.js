var express = require('express')
var path = require('path')
var url = require('url');

var app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'pug')
app.set('views','public')

app.get('/', function(req, res) {
    var now = new Date()
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var result = {unix: Math.floor(now/1000), natural : now, url: fullUrl }
    
    res.render('index', result )
})

app.get('/new:longUrl', function(req, res) {
     var result = { original_url : undefined,  short_url: undefined };
     
     res.json(result)
})

app.listen(process.env.PORT || 3000)
