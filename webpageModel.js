var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    decipher = require('./decipher');

var CounterSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
var counter = mongoose.model('counter', CounterSchema);

// first add this to the db
// db.counters.insert(  {   _id: "url_id",   seq: 0  } )

var WebpageSchema   = new Schema({
    id: String,
    url: String,
    created_at : Date,
    touched_at : Date
});

WebpageSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'url_id'}, {$inc:{seq:1}}, function(error, counter)   {
        if(error)
            return next(error);
        doc.id = decipher.encode( counter.seq );
        next();
    });
});

module.exports = mongoose.model('WebpageModel', WebpageSchema);
