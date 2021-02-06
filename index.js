require('dotenv').config()
const express = require('express');
const routes = require('./routes')
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

//not found middleware
app.get((req, res, next) => {
    res.status(404).end();
})


// error middleware handler
app.use((err, req, res, next) => {
    if (err instanceof mongoose.Error) {
        res.status(422).json(err.message);
    }
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