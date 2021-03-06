const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helper/db');
const User = db.User;
const cloudinary = require("../helper/cloudinary");

async function login(req, res) {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    // validate
    if (!user) {
        res.status(404).send({ message: "WRONG_USERNAME" });
        return;
    }
    const ValidPass = user.validatePassword(password);
    // validate
    if (!ValidPass) {
        res.status(400).send({ message: "WRONG_PASSWORD" });
        return;
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
        //  res.cookie('token', token, { httpOnly: true, }).send();
        return { ...user.toJSON(), token };
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

async function create(req, res) {
    const { body } = req;

    // validate
    if (await User.findOne({ username: body.username })) {
        res.status(400).send({ message: "USERNAME_TAKEN" });
        return;
    }
    if (await User.findOne({ email: body.email })) {
        res.status(400).send({ message: "EMAIL_REGISTERED" });
        return;
    }
    const user = new User(body);
    await user.save();
}
async function checkUsername(req, res) {
    const { body } = req;
    if (await User.findOne({ username: body.username })) {
        res.status(400).send({ message: "USERNAME_TAKEN" });
        return;
    }
    return false;
}

async function checkEmail(req, res) {
    const { body } = req;
    if (await User.findOne({ email: body.email })) {
        res.status(400).send({ message: "EMAIL_REGISTERED" });
        return;
    }
    return false;
}

async function update(req, res) {
    const { user, body, file } = req;
    const getUser = await User.findById(user._id);

    // validate
    if (!getUser) throw 'User not found';
    if (user.username !== body.username && await User.findOne({ username: body.username })) {
        throw `Username ${body.username} is already taken`;
    }


    if (file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        const user = {
            ...body,
            profilePhoto: result.secure_url,
            cloudinary_id: result.public_id
        }
        await User.updateOne({ _id: getUser._id }, user,
            function (err, result) {
                if (err) {
                    res.send(err);
                }
            });
    } else {
        await User.updateOne({ _id: getUser._id }, body,
            function (err, result) {
                if (err) {
                    res.send(err);
                }
            });
    }
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
            }
        });
    await User.updateOne({ _id: followUser._id }, { $addToSet: { follower: getUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
        });
    return { message: "FOLLOWED" };
}
async function unFollow(req, res) {

    const { user } = req;
    const { params: { id } } = req;
    const getUser = await User.findById(user._id).exec();
    const followUser = await User.findById(id).exec();
    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");
    if (!followUser)
        return res.sendStatus(404).send("NOT_FOUND");

    await User.updateOne({ _id: getUser._id }, { $pull: { following: id } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
        });
    await User.updateOne({ _id: id }, { $pull: { follower: getUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
        });

    return { message: 'UNFOLLOWED' };
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
async function getUsersSuggestions(req, res) {
    const { user } = req;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");

    const { following } = await getById(getUser._id)
    return await User.find({ '_id': { $nin: following } }).exec();
}
async function deleteUser(req, res) {
    const { user } = req;
    const getUser = await User.findById(user._id);

    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");

    await cloudinary.uploader.destroy(user.cloudinary_id);
    await User.findByIdAndRemove(user._id);
    return res.sendStatus(200).json({ message: "DELETED" });

}
async function getFollowingCheck(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const followingUID = user.following;
    const getUser = await User.findById(user._id).exec();
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    if (followingUID.includes(id)) {
        return true;
    }
    return false;

}

async function logout(res, req) {
    const { user } = req;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(403).send("UN_AUTHENTICATED");

    return await res.status(200).send({ auth: false, token: null });
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
    getUsersSuggestions,
    follow,
    unFollow,
    checkEmail,
    checkUsername,
    getFollowingCheck
};