var express = require('express')
var path = require('path')
var url = require('url');

var app = express()

function getShortCode(originalUrl) {
 var shortCode = originalUrl
 return shortCode;   
}

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'pug')
app.set('views','public')

app.get('/new/*', function(req, res) {
     var result = { original_url : undefined,  short_url: undefined };
     if (req.originalUrl) {
        result.original_url = req.originalUrl.substr(5);
        result.short_url =  getShortCode(result.original_url);
     }
     
     res.json(result)
})


app.get('/', function(req, res) {
    var now = new Date()
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var result = {unix: Math.floor(now/1000), natural : now, url: fullUrl }
    
    res.render('index', result )
})


app.listen(process.env.PORT || 3000)
