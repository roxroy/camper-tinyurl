var mongoose = require('mongoose'),
    urlHelper = require('./urlhelper'),
    WeblinkModel = require('./weblinkModel');

var db_url = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tinyurls';
mongoose.connect(db_url);

exports.index = function(req, res){
  res.render('index', { url: urlHelper.getSiteUrl(req) } )
};

const getUniqueCode = function(res, result, baseSiteUrl, cb_saveWebLink) {
	var shortCode = Math.random().toString(36).slice(2,6);
	//console.log(shortCode);
	var query  = WeblinkModel.where({ code: shortCode });
	query.findOne(function (err, weblink) {
	  if ( err ) {
		  return res.json({Error: 'Sorry, something went wrong!'});
	  }
	  if (!weblink) {
		  cb_saveWebLink(result, baseSiteUrl, shortCode);
		  return res.json(result);;
	  } else {
	    //console.log('dupe: '+shortCode);
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
  if (!urlHelper.isValidUrl(originalUrl))
     return res.json({Error: 'Invalid URL'}); 
  
  var result = { original_url : undefined,  short_url: undefined };
  result.original_url = originalUrl;
  var  baseSiteUrl =  urlHelper.getBaseSiteUrl(req) +'/';
  
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
