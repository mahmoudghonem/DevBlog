require('dotenv').config()
const express = require('express');
const routes = require('./routes')
// const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 80;


// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// app.use(cors());

app.use('/', routes);

//not found middleware
app.get((req, res, next) => {
    res.status(404).end();
})


// error middleware handler
app.use((err, req, res, next) => {
    if (err.code == 11000) {
        res.status(422).json({
            statusCode: 'validatorError', property: err.keyValue,
        });
    };
    if (err.message === 'AUTHENTICATION_REQUIRED') {
        res.status(401).json({
            statusCode: 'validatorError', property: err.keyValue,
        });
    };

    const { statusCode = 500 } = err;
    res.status(statusCode).json(err.message);
});




app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})