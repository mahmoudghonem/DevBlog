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
async function getById(req, res) {
    const { id } = req.params;
    const article = await Article.findById(id);
    const reads = article.reads + 1;
    return await Article.updateOne({ _id: id }, { $set: { reads: reads } }, { new: true }, (err, doc) => {
        if (err) {
            res.send(err);
        } else {
            res.send(doc);
        }

    });

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
    return await Article.find(title).exec()
}

async function searchByTag(tag) {
    return await Article.find(tag).exec();
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


    await Article.updateOne({ _id: id }, { $pull: { likes: user._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    return;
}
async function comment(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const { body: { comment } } = req;
    const userId = user._id;
    await Article.updateOne({ _id: id }, { $addToSet: { comments: { userId, comment } } },
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
    comment,
    getFollowArticles
}
