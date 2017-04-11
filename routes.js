var mongoose = require('mongoose'),
    WebpageModel = require('./webpageModel');

mongoose.connect('mongodb://localhost/weblinks');

function isValidUrl(url) {
  var url_pattern = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  return url_pattern.test(url);
}
 
exports.index = function(req, res){
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.render('index', {url: fullUrl } )
};

exports.add = function(req, res){
  var originalUrl = req.originalUrl.substr(5).trim();
  if (!isValidUrl(originalUrl))
     return res.json({Error: 'Invalid URL'}); 
  
  var result = { original_url : undefined,  short_url: undefined };
  result.original_url =originalUrl;
  
  new WebpageModel({
    url : result.original_url, 
    updated_at : Date.now()
  }).save( function( err, webpage, count ){
      if ( err ) {
          return res.json({Error: 'Sorry, something went wrong!'});
      }
      result.short_url = webpage.id;
      res.json(result)
  });
};

exports.redirect = function(req, res){
  var short_url = req.params.short_url;
  if (short_url) {
    var query  = WebpageModel.where({ id: short_url });
    query.findOne(function (err, webpage) {
    if ( err ) {
        return res.json({Error: 'Sorry, something went wrong!'});
    }
      if (webpage) {
        return res.redirect(301, webpage.url);
      }
    });
  }
  return res.json({Error: 'Unknown short code.'}); 
};
