var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WeblinkModelSchema   = new Schema({
    code: String,
    url: String,
    when: { type: Date, default: Date.now}
});

module.exports = mongoose.model('WeblinkModel', WeblinkModelSchema, "weblink");
