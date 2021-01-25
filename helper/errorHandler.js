const mongoose = require('mongoose');

function errorHandler(err, req, res, next) {

    if (typeof (err) === 'string') {
        // custom application error
        return res.status(400).json({ message: err });
    }

    if (err.name === 'ValidationError') {
        // mongoose validation error
        return res.status(400).json({ message: err.message });
    }
    if (err.name === 'UN_AUTHENTICATED') {
        // jwt authentication error
        return res.status(401).json({ message: 'Invalid Token' });
    }
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(422).json(err.errors)
    }
    // default to 500 server error
    return res.status(500).json({ message: err.message });
}
module.exports = errorHandler;
