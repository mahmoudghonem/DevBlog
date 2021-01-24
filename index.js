require('dotenv').config()
const express = require('express');
const routes=require('./routes')
const mongoose = require('mongoose');
const errorHandler = require('./helper/errorHandler');
const app = express();
const PORT = process.env.PORT;
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

app.use('/', routes);

//not found middleware
app.get('*', (req, res,next) => {
    res.status(404).end();
})
app.use(errorHandler);
//error handler middleware
app.use((err, req, res, next) => {
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(422).json(err.errors)
    }
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})