require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helper/db');
const User = db.User;

async function login({ username, password }) {
    const user = await User.findOne({ username });
    // validate
    if (!user) {
        throw Error('Wrong Username');
    }
    const ValidPass = user.validatePassword(password);
    // validate
    if (!ValidPass) {
        throw Error('Wrong Password');
    }
    // validate

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({
            username: user.username,
            id: user.id,
        },
            process.env.ACCESS_TOKEN_SECERT,
            { expiresIn: '1d' }
        );
        // const refreshToken  = jwt.sign({
        //     username: user.username,
        //     id: user.id,
        // },
        //     process.env.REFRESH_TOKEN_SECRET,
        //     { expiresIn: process.env.REFRESH_TOKEN_LIFE }
        // );
        return {
            ...user.toJSON(),
            token
        };
    }
}
async function getAll() {
    return await User.find();
}
async function getById(id) {
    return await User.findById(id);
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw `Username ${userParam.username} is already taken`;
    }
    const user = new User(userParam);
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);
    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw `Username ${userParam.username} is already taken`;
    }
    // copy userParam properties to user
    Object.assign(user, userParam);
    await user.findOneAndUpdate();
}

async function follow(req, res) {
    const { user } = req;
    const { params: { id } } = req;

    const getUser = await User.findById(user._id);

    await User.updateOne({ _id: user._id }, { $addToSet: { following: id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    await User.updateOne({ _id: id }, { $addToSet: { following: getUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    return;
}
async function unFollow(req, res) {
    const { user } = req;
    const { params: { id } } = req;

    const getUser = await User.findById(user._id);

    await User.updateOne({ _id: user._id }, { $pull: { following: id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    await User.updateOne({ _id: id }, { $pull: { following: getUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    return;
}
async function getFollowers(id) {
    const { follower } = await getById(id)
    return await User.find().where('_id').in(follower).exec();
}
async function getFollowing(id) {
    const { following } = await getById(id)
    return await User.find().where('_id').in(following).exec();
}
async function deleteUser(id) {
    await User.findByIdAndRemove(id);
}
async function logout(res, req) {
    await res.status(200).send({ auth: false, token: null });

}
module.exports = {
    login,
    getAll,
    getById,
    create,
    update,
    deleteUser,
    logout,
    getFollowers,
    getFollowing,
    follow,
    unFollow
};