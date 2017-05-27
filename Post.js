var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema({
    title: {
        type: String,
        unique: false,
        required: true
    },
    price:{
        type: "String",
        required: false,
        unique: false,
        default: "Not entered"
    },
    time: {
        type: String,
        unique: false,
        require:false
    },
    link: {
        type: String,
        required: false,
        unique: true
    },
    comments: {
        type: Array,
        required: false,
    }
});

var Post = mongoose.model("Post", PostSchema);

module.exports = Post;