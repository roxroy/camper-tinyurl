function getShortCode(originalUrl) {
 var shortCode = originalUrl
 return shortCode;   
}


exports.index = function(req, res){
  //res.send("respond with HOME resource");
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.render('index', {url: fullUrl } )
};

exports.add = function(req, res){
  var result = { original_url : undefined,  short_url: undefined };
  if (req.originalUrl) {
    result.original_url = req.originalUrl.substr(5);
    result.short_url = getShortCode(result.original_url);
  }
  
  res.json(result)
};

exports.redirect = function(req, res){
  res.send("respond with a redirect resource");
};
