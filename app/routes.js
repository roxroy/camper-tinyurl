var mongoose = require('mongoose'),
    WeblinkModel = require('./weblinkModel');

var db_url = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tinyurls';
mongoose.connect(db_url);

function isValidUrl(url) {
  var url_pattern = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  return url_pattern.test(url);
}

function getProtocol(xforwardedproto) {
  return xforwardedproto && xforwardedproto === "https" ? 'https' : 'http';
}

function getSiteUrl(req) {
  return getProtocol(req.headers['x-forwarded-proto']) + '://' + req.get('host') + req.originalUrl;
}

function getBaseSiteUrl(req) {
  return getProtocol(req.headers['x-forwarded-proto']) + '://' + req.get('host');
}


exports.index = function(req, res){
  res.render('index', { url:getSiteUrl(req) } )
};

const getUniqueCode = function(res, result, baseSiteUrl, cb_saveWebLink) {
	var shortCode = Math.random().toString(36).slice(2,3);
	console.log(shortCode);
	var query  = WeblinkModel.where({ code: shortCode });
	query.findOne(function (err, weblink) {
	  if ( err ) {
		  return res.json({Error: 'Sorry, something went wrong!'});
	  }
	  if (!weblink) {
		  cb_saveWebLink(result, baseSiteUrl, shortCode);
		  return res.json(result);;
	  } else {
	    console.log('dupe: '+shortCode);
			getUniqueCode(res, result, baseSiteUrl,  cb_saveWebLink);
	  }
	});
};

const saveWebLink = function(result, baseSiteUrl, shortCode) {
    new WeblinkModel({
      code : shortCode, 
      url : result.original_url
    }).save();
    result.short_url = baseSiteUrl + shortCode;
    return result;
};


exports.add = function(req, res){
  var originalUrl = req.originalUrl.substr(5).trim();
  if (!isValidUrl(originalUrl))
     return res.json({Error: 'Invalid URL'}); 
  
  var result = { original_url : undefined,  short_url: undefined };
  result.original_url = originalUrl;
  var  baseSiteUrl =  getBaseSiteUrl(req) +'/';
  
  getUniqueCode(res, result, baseSiteUrl, saveWebLink);
};

exports.redirect = function(req, res){
  var short_url = req.params.short_url;
  if (short_url) {
    var query  = WeblinkModel.where({ code:short_url });
    query.findOne(function (err, webpage) {
      if ( err ) {
        return res.json({Error: 'Sorry, something went wrong!'});
      }
      if (webpage) {
          res.redirect(301, webpage.url);
      }else {
          return res.json({Error: 'Unknown short link.'}); 
      }
    });
  }
};
