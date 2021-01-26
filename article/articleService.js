const db = require('../helper/db');
const Article = db.Article;
const User = db.User;


async function create(req, res) {
    const { body, user } = req
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    const username = getUser.username;
    const userId = getUser._id;
    const article = await Article.create({ ...body, author: username, userId: userId }).then((a) => {
        return a;
    });
    await User.updateOne({ username: getUser.username }, { $addToSet: { articles: article._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
        });
    return article;

}

async function getAll() {
    return await Article.find();
}
async function getFollowArticles(req, res) {
    const { user } = req;
    const followingUID = user.following;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.find('userId').where('_id').in(followingUID).exec();
}
async function getMyArticles(req, res) {
    const { user } = req;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    const userArticles = getUser.articles;
    return await Article.find({ '_id': userArticles }).exec();
}
async function saveArticle(req, res) {
    const { user } = req;
    const { id } = req.params;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    const article = await Article.findById(id);
    await User.updateOne({ username: getUser.username }, { $addToSet: { savearticles: article._id } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
        });
}
async function getSavedArticles(req, res) {
    const { user } = req;
    const savedUID = user.savearticles;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.find('_id').where('_id').in(savedUID).exec();
}
async function getById(req, res) {
    const { id } = req.params;
    const article = await Article.findById(id);
    const reads = article.reads + 1;
    return await Article.findByIdAndUpdate({ _id: id }, { $set: { reads: reads } }, { new: true }, (err, doc) => {
        if (err) {
            res.send(err);
        }
    });

}
async function editbyId(req, res) {
    const { user } = req;
    const { id } = req.params;
    const getUser = await User.findById(user._id);
    const article = Article.findById(id);
    if (getUser._id != article.author.userId)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.findByIdAndUpdate(id, body, { new: true })
}
async function deletbyId(req, res) {
    const { params: { id } } = req;
    const { user } = req;
    const getUser = await User.findById(user._id);
    const article = Article.findById(id);
    if (getUser._id != article.author.userId)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    await Article.findByIdAndDelete(id).exec();
    await User.updateOne({ username: user.username }, { $pull: { articles: id } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
            return res.send(result);

        });
}

async function searchBy(req, res) {
    const { user } = req;
    const { title, author, tags } = req.query;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    if (title) {
        return await Article.find({ 'title':  { "$regex" : title}}).exec();
    } else if (author) {
        return await Article.find({ 'author': author }).exec();
    } else if (tags) {
        return await Article.find({ 'tags': tags }).exec();
    }
}

async function doLike(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const getUser = await User.findById(user._id);
    const userId = getUser._id;
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.updateOne({ _id: id }, { $addToSet: { likes: userId } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
        });
}
async function unLike(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const getUser = await User.findById(user._id);
    const userId = getUser._id;
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.updateOne({ _id: id }, { $pull: { likes: userId } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
        });
}
async function comment(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const { body: { comment } } = req;
    const userId = user._id;
    const getUser = await User.findById(userId);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.updateOne({ _id: id }, { $addToSet: { comments: { userId, comment } } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
        });
}
module.exports = {
    create,
    getAll,
    getById,
    editbyId,
    deletbyId,
    searchBy,
    doLike,
    unLike,
    comment,
    getSavedArticles,
    saveArticle,
    getFollowArticles,
    getMyArticles
}
