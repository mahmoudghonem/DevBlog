const express = require('express');
const userService = require('./userService');
const router = express.Router();
const jwtAuth = require('../helper/jwt')
const imageFile = require("../helper/img");

// routes
router.post('/authenticate', login);
router.post('/register', register);
router.get('/', jwtAuth, getAll);
router.get('/me', jwtAuth, getUser);
router.get('/:id', getById);
router.get('/following/:id', jwtAuth, getFollowing);
router.get('/followers/:id', jwtAuth, getFollowers);
router.patch('/follow/:id', jwtAuth, follow);
router.patch('/unfollow/:id', jwtAuth, unFollow);
router.patch('/update/', jwtAuth, imageFile, update);
router.delete('/delete/', jwtAuth, removeUser);
router.get('/usernamecheck', checkUsername);
router.get('/emailcheck', checkEmail);
router.get('/logout', jwtAuth, logout);


function login(req, res, next) {
    userService.login(req, res)
        .then((user) => {
            user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' })
        }).catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req, res)
        .then(() => res.json({ message: "ACCOUNT_CREATED" }))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getUser(req, res, next) {
    userService.getMe(req, res)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req, res)
        .then((e) => res.json(e))
        .catch(err => next(err));
}

function removeUser(req, res, next) {
    userService.delete(req, res)
        .then((e) => res.json(e))
        .catch(err => next(err));
}
function logout(req, res, next) {
    userService.logout(res, req)
        .then(() => res.json({ message: "Logout......." }))
        .catch(err => next(err));
}
function getFollowers(req, res, next) {
    userService.getFollowers(req, res)
        .then((e) => res.json(e))
        .catch(err => next(err));
}
function getFollowing(req, res, next) {
    userService.getFollowing(req, res)
        .then((e) => res.json(e))
        .catch(err => next(err));
}
function follow(req, res, next) {
    userService.follow(req, res)
        .then((e) => res.json(e))
        .catch(err => next(err));
}
function unFollow(req, res, next) {
    userService.unFollow(req, res)
        .then((e) => res.json(e))
        .catch(err => next(err));
}
function checkEmail(req, res, next) {
    userService.checkEmail(req, res)
        .then((e) => res.json(e))
        .catch(err => next(err));
}
function checkUsername(req, res, next) {
    userService.checkUsername(req, res)
        .then((e) => res.json(e))
        .catch(err => next(err));
}

module.exports = router;