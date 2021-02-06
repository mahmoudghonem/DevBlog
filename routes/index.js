const express = require('express');
const user = require('../user/userRoute');
const article = require('../article/articleRoute');
const router = express.Router();

router.use('/users', user);
router.use('/articles', article);
router.use('/', (req, res) => {
    res.send("HELLO TO OUR DEVS BLOG BACKEND")
});
module.exports = router;