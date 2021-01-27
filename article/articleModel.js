const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema } = mongoose;

const ArticleModel = new Schema({
    title: {
        type: String,
        minLength: 5,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    likes: [String],
    comments: [{
        id: String,
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    reads: {
        type: Number,
        default: 0
    },
    author: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

});
ArticleModel.plugin(mongoosePaginate);
const articleModel = mongoose.model('Article', ArticleModel);
articleModel.paginate().then({});

module.exports = articleModel;