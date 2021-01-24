require('dotenv').config()
const mongoose = require('mongoose');

const connectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};

mongoose.connect(process.env.MONGO_URL, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../user/userModel'),
    Article: require('../article/articleModel')
};