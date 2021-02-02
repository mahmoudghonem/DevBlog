require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require("path");
const routes = require('./routes')
const errorHandler = require('./helper/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors);
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

app.use("/images", express.static(path.join("images")));

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