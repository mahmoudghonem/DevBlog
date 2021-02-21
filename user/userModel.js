const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const UserModel = new Schema({
    firstname: {
        type: String,
        maxLength: 140,
        required: true
    },
    lastname: {
        type: String,
        maxLength: 140,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        minLength: 8,
        maxLength: 140
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    bio: {
        type: String,
        default: 'This is my bio',
        maxLength: 240,
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    profilePhoto: {
        type: String
    },
    cloudinary_id: {
        type: String
    },
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
    }],
    follower: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
    }],
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'articles',
    }],
    savearticles: [{
        type: Schema.Types.ObjectId,
        ref: 'articles',
    }]
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret, options) => {
            delete ret.password;
            return ret;
        },
    },
});
UserModel.pre('save', function preSave(next) {
    this.password = bcrypt.hashSync(this.password, 8);
    next();
});
UserModel.pre('findOneAndUpdate', function preSave(next) {
    if (!this._update.password) {
        return;
    }
    this._update.password = bcrypt.hashSync(this._update.password, 8);
    next();
});
UserModel.methods.validatePassword = function validatePassword(password) {
    return bcrypt.compareSync(password, this.password);
};
const userModel = mongoose.model('User', UserModel);
module.exports = userModel;