const mongoose = require('mongoose');

const connectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
const { MONGO_URL } = process.env;
mongoose.connect(MONGO_URL, connectionOptions).then(() =>
    console.log("Database Connected Successfully"))
    .catch(err => console.log(err));
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../user/userModel'),
    Article: require('../article/articleModel')
};