const express = require('express');
const userService = require('./userService');
const router = express.Router();
const jwtAuth = require('../helper/jwt')

// routes
router.post('/authenticate', login);
router.post('/register', register);
router.get('/', getAll);
router.get('/me', jwtAuth, getUser);
router.get('/:id', getById);
router.get('/following/:id', jwtAuth, getFollowing);
router.get('/followers/:id', jwtAuth, getFollowers);
router.patch('/follow/:id', jwtAuth, follow);
router.patch('/unfollow/:id', jwtAuth, unFollow);
router.patch('/update/:id', jwtAuth, update);
router.delete('/delete/:id', jwtAuth, removeUser);
router.get('/logout', jwtAuth, logout);


function login(req, res, next) {
    userService.login(req.body)
        .then((user) => {
            user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' })
        }).catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getUser(req, res, next) {
    userService.getById(req.user.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function removeUser(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function logout(req, res, next) {
    userService.logout(res, req)
        .then(() => res.json({ message: "Logout......." }))
        .catch(err => next(err));
}
function getFollowers(req, res, next) {
    userService.getFollowers(req.params.id)
        .then((e) => res.json({}))
        .catch(err => next(err));
}
function getFollowing(req, res, next) {
    userService.getFollowing(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function follow(req, res, next) {
    userService.follow(req, res)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function unFollow(req, res, next) {
    userService.unFollow(req, res)
        .then(() => res.json({}))
        .catch(err => next(err));
}
module.exports = router;