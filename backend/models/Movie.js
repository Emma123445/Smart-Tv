const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  desc: { type: String },
    img: { type: String, required: true },
    imgTitle: { type: String },
    imgSm: { type: String },
    trailer: { type: String },
    video: { type: String },
    year: { type: String },
    genre: { type: String },
    // duration: { type: String },
    limit: { type: Number },
    // rating: { type: String },
    isSeries: { type: Boolean, default: false  },
    // createdAt: { type: Date, default: Date.now
},
 { 
    timestamps: true 
});
module.exports = mongose.model("Movie", MovieShema);