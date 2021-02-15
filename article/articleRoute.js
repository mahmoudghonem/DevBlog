const express = require('express');
const articleService = require('./articleService');
const router = express.Router();
const jwtAuth = require('../helper/jwt');
const imageFile = require("../helper/img");


// routes
router.get('/', getAll);
router.get('/getBlogs', getBlogs);
router.get('/myarticles', jwtAuth, getMyArticles);
router.get('/followArticles', jwtAuth, getFollowingArticles);
router.get('/savedArticles', jwtAuth, getSavedArticles);
router.get('/search/', jwtAuth, searchBy);
router.get('/:id', getById);
router.get('/likecount/:id', likesCount);
// router.get('/comments/:id',jwtAuth,getArticleComments );
// router.patch('/comments/:id/:id',jwtAuth,replayToComment );
router.post('/create', jwtAuth,  imageFile.single('image'), createArticle);
router.patch('/update/:id', jwtAuth,  imageFile.single('image'), update);
router.patch('/like/:id', jwtAuth, like);
router.patch('/dislike/:id', jwtAuth, dislike);
router.patch('/comment/:id', jwtAuth, comment);
router.delete('/:id/comment/:commentid', jwtAuth, deleteComment);
router.patch('/saveArticle/:id', jwtAuth, saveArticle);
router.patch('/removeSavedArticle/:id', jwtAuth, removeSavedArticle);
router.delete('/delete/:id', jwtAuth, removeArticle);


function getAll(req, res, next) {
    articleService.getAll(req, res)
        .then(articles => res.json(articles))
        .catch(err => next(err));
}
function getBlogs(req, res, next) {
    articleService.getBlogs(req, res)
        .then(articles => res.json(articles))
        .catch(err => next(err));
}
function getMyArticles(req, res, next) {
    articleService.getMyArticles(req, res)
        .then(articles => res.json(articles))
        .catch(err => next(err));
}
function createArticle(req, res, next) {
    articleService.create(req, res)
        .then(article => res.json(article))
        .catch(err => next(err));
}

function getById(req, res, next) {
    articleService.getById(req, res)
        .then(article => article ? res.json(article) : res.sendStatus(404))
        .catch(err => next(err));
}

function searchBy(req, res, next) {
    articleService.searchBy(req, res)
        .then(article => article ? res.json(article) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    articleService.editbyId(req, res)
        .then((article) => res.json(article))
        .catch(err => next(err));
}
function likesCount(req, res, next) {
    articleService.likesCount(req, res)
        .then((e) => res.json(e))
        .catch(err => next(err));
}
function like(req, res, next) {
    articleService.doLike(req, res)
        .then((e) => res.json({ message: "LIKED" }))
        .catch(err => next(err));
}
function dislike(req, res, next) {
    articleService.unLike(req, res)
        .then((e) => res.json({ message: "UNLIKED" }))
        .catch(err => next(err));
}
function comment(req, res, next) {
    articleService.comment(req, res)
        .then((e) => res.json({ message: "COMMENTED" }))
        .catch(err => next(err));
}
function deleteComment(req, res, next) {
    articleService.deleteComment(req, res)
        .then((e) => res.json({ message: "DELETED" }))
        .catch(err => next(err));
}
// function getArticleComments(req, res, next) {
//     articleService.getArticleComments(req, res)
//         .then((e) => res.json(e))
//         .catch(err => next(err));
// }

// function replayToComment(req, res, next) {
//     articleService.getArticleComments(req, res)
//         .then((e) => res.json(e))
//         .catch(err => next(err));
// }
function saveArticle(req, res, next) {
    articleService.saveArticle(req, res)
        .then((e) => res.json({ message: "SAVED" }))
        .catch(err => next(err));
}
function removeSavedArticle(req, res, next) {
    articleService.removeSavedArticle(req, res)
        .then((e) => res.json({ message: "UNSAVED" }))
        .catch(err => next(err));
}
function getSavedArticles(req, res, next) {
    articleService.getSavedArticles(req, res)
        .then((articles) => res.json(articles))
        .catch(err => next(err));
}
function getFollowingArticles(req, res, next) {
    articleService.getFollowArticles(req, res)
        .then((articles) => res.json(articles))
        .catch(err => next(err));
}

function removeArticle(req, res, next) {
    articleService.deletbyId(req, res)
        .then((e) => res.json({ message: "DELETED" }))
        .catch(err => next(err));
}


module.exports = router;