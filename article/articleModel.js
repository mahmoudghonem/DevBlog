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
    photo: {
        type: String,
    },
    cloudinary_id: {
        type: String,
    },
    likes: [String],
    comments: [{
        commentId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        author: {
            type: String
        },
        comment: {
            type: String,
            maxlength: 240,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    }],
    reads: {
        type: Number,
        default: 0
    },
    author: {
        type: String
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },

});
ArticleModel.plugin(mongoosePaginate);
const articleModel = mongoose.model('Article', ArticleModel);
articleModel.paginate().then({});

module.exports = articleModel;