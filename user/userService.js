require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helper/db');
const User = db.User;

async function login(req, res) {
    const { username, password } = req.body;
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

        res.cookie('token', token, { httpOnly: true, }).send();
    }
}
async function getAll() {
    return await User.find();
}
async function getById(id) {
    return await User.findById(id);
}
async function getMe(req, res) {
    const { user } = req;
    const getUser = await User.findById(user._id);

    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");

    return await User.findById(user._id);
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw `Username ${userParam.username} is already taken`;
    }
    const user = new User(userParam);
    await user.save();
}

async function update(req, res) {
    const { user } = req;
    const getUser = await User.findById(user._id);

    // validate
    if (!getUser) throw 'User not found';
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
    const followUser = await User.findById(id);
    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");
    if (!followUser)
        return res.sendStatus(404).send("NOT_FOUND");

    await User.updateOne({ _id: getUser._id }, { $addToSet: { following: followUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    await User.updateOne({ _id: followUser._id }, { $addToSet: { follower: getUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    return res.sendStatus(200).json({ message: "FOLLOW" });
}
async function unFollow(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const getUser = await User.findById(user._id);
    const followUser = await User.findById(id);
    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");
    if (!followUser)
        return res.sendStatus(404).send("NOT_FOUND");

    await User.updateOne({ _id: getUser._id }, { $pull: { following: followUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    await User.updateOne({ _id: followUser._id }, { $pull: { following: getUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    return res.sendStatus(200).json({ message: "UNFOLLOW" });
}
async function getFollowers(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");

    const { follower } = await getById(id);
    return await User.find({ '_id': follower }).exec();
}
async function getFollowing(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");

    const { following } = await getById(id)
    return await User.find({ '_id': following }).exec();
}
async function deleteUser(req, res) {
    const { user } = req;
    const getUser = await User.findById(user._id);

    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");

    await User.findByIdAndRemove(user._id);
    return res.sendStatus(200).json({ message: "DELETED" });

}
async function logout(res, req) {
    const { user } = req;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");

    await res.status(200).send({ auth: false, token: null });

}
module.exports = {
    login,
    getAll,
    getById,
    getMe,
    create,
    update,
    deleteUser,
    logout,
    getFollowers,
    getFollowing,
    follow,
    unFollow
};