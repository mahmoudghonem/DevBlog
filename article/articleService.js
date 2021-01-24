const db = require('../helper/db');
const Article = db.Article;
const User = db.User;

async function create(req, res) {
    const { body, user } = req
    const getUser = await User.findById(user._id);
    let aId;
    await Article.create({ ...body, userId: user._id }).then((a) => {
        aId = a._id;
    });
    await User.updateOne({ username: getUser.username }, { $addToSet: { articles: aId } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    return;
}
async function getAll() {
    return await Article.find();
}
async function getFollowArticles(req, res) {
    const { user } = req;
    const followingUID = user.following;
    return await Article.find('userId').where('_id').in(followingUID).exec();
}
async function getById(id) {
    return await Article.findById(id);
}
async function editbyId(id, body) {
    await Article.findByIdAndUpdate(id, body, { new: true })
}
async function deletbyId(req, res) {
    const { params: { id } } = req;
    const aId = id;
    const { user } = req;
    await Article.findByIdAndDelete(aId).exec();
    await User.updateOne({ username: user.username }, { $pull: { articles: aId } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
}
async function searchByTitle(title) {
    Article.find(title).exec()
}

async function searchByTag(tag) {
    Article.find(tag).exec();
}
async function doLike(req, res) {
    const { user } = req;
    const { params: { id } } = req;

    const getUser = await User.findById(user._id);

    await Article.updateOne({ _id: id }, { $addToSet: { likes: getUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });

    return;
}
async function unLike(req, res) {
    const { user } = req;
    const { params: { id } } = req;

    const getUser = await User.findById(user._id);

    await Article.updateOne({ _id: id }, { $pull: { likes: getUser._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });

    return;
}
module.exports = {
    create,
    getAll,
    getById,
    editbyId,
    deletbyId,
    searchByTitle,
    searchByTag,
    doLike,
    unLike,
    getFollowArticles
}
