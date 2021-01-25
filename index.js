require('dotenv').config()
const express = require('express');
const routes=require('./routes')
const errorHandler = require('./helper/errorHandler');
const app = express();
const PORT = process.env.PORT || 3000;
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

app.use('/', routes);

//not found middleware
app.get('*', (req, res,next) => {
    res.status(404).end();
})
//error handler middleware
app.use((err, req, res, next) => {
    errorHandler(err,req,res,next);
    res.status(503).end();

})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})