require('dotenv').config()
const express = require('express');
const path = require("path");
const routes = require('./routes')
const errorHandler = require('./helper/errorHandler');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 80;

// app.use(function (req, res, next) {
//     //Enabling CORS
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
//     next();
// });
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
app.use(cors());

app.use('/', routes);

//error handler middleware
app.use(errorHandler);

//not found middleware
app.get('*', (req, res, next) => {
    res.status(404).end();
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})