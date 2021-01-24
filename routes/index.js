const express = require('express');
const user = require('../user/userRoute');
const article = require('../article/articleRoute');
const router = express.Router();

router.use('/users',user);
router.use('/articles',article);

module.exports=router;