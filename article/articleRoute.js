const express = require('express');
const articleService = require('./articleService');
const router = express.Router();
const jwtAuth = require('../helper/jwt')
// routes
router.get('/', getAll);
router.get('/followArticles',jwtAuth, getFollowingArticles);
router.get('/search/:title', jwtAuth, searchByTitle);
router.get('/search/:tag', jwtAuth, searchByTags);
router.post('/create', jwtAuth, createArticle);
router.get('/:id', getById);
router.patch('/update/:id', jwtAuth, update);
router.patch('/like/:id', jwtAuth, like);
router.patch('/dislike/:id', jwtAuth, dislike);
router.delete('/delete/:id', jwtAuth, removeArticle);


function getAll(req, res, next) {
    articleService.getAll()
        .then(articles => res.json(articles))
        .catch(err => next(err));
}
function createArticle(req, res, next) {
    articleService.create(req,res)
        .then(article => res.json(article))
        .catch(err => next(err));
}

function getById(req, res, next) {
    articleService.getById(req.params.id)
        .then(article => article ? res.json(article) : res.sendStatus(404))
        .catch(err => next(err));
}
function searchByTitle(req, res, next) {
    articleService.searchByTitle(req.params.title)
        .then(article => article ? res.json(article) : res.sendStatus(404))
        .catch(err => next(err));
}
function searchByTags(req, res, next) {
    articleService.searchByTag(req.params.tag)
        .then(article => article ? res.json(article) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    articleService.editbyId(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function like(req, res, next) {
    articleService.doLike(req, res)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function dislike(req, res, next) {
    articleService.unLike(req, res)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function getFollowingArticles(req, res, next) {
    articleService.getFollowArticles(req, res)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function removeArticle(req, res, next) {
    articleService.deletbyId(req,res)
        .then(() => res.json({}))
        .catch(err => next(err));
}


module.exports = router;