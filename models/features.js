var mongoose = require("mongoose");

var featureSchema = new mongoose.Schema({
   	heading:{
		type: String,
		required: true
	},
	image1: {
		type: String,
		required: true
	},
	image2: {
		type: String,
		required: true
	},
	image3: {
		type: String,
		required: true
	},
	image4: {
		type: String,
		required: true
	},
	maindesc: {
		type: String,
		required: true
	},
	subdesc:{
		type:String,
		required:true
	}
});

module.exports = mongoose.model("Features", featureSchema);





