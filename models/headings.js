var mongoose = require("mongoose");

var headingsSchema = new mongoose.Schema({
   heading: String,
   subheading: String
});

module.exports = mongoose.model("Heading", headingsSchema);