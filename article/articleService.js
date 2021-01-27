const db = require('../helper/db');
const Article = db.Article;
const User = db.User;
const multer = require('multer');
const imageHandler = require('../helper/imageHandler');
const path = require('path');


// //Set Storage Engine
// const storage = multer.diskStorage({
//     destination: './public/uploads/images',
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() +
//             path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage, fileFilter: imageHandler }).single('image');

async function create(req, res) {
    const { body, user } = req
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    // console.log(req.body); // return empty
    // console.log(req.file); // return empty

    // await upload(req, res, function (err) {

    //     console.log(req.body); // return full value
    //     console.log(req.file); // return full value

    //     if (err) {
    //         return res.end("Something went wrong!" + err);
    //     }
    // });

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

async function getAll(req, res) {
    return await Article.find().sort({ createdAt: -1 });
}
async function getBlogs(req, res) {
    const { limit } = req.query;
    const { page } = req.query;
    const query = {};

    const options = {
        page: page || 1,
        limit: limit || 10,
        sort: { createdAt: -1 }
    }
    return await Article.paginate(query, options).then((result) => {
        return result;
    }).catch((err) => {
        if (err) {
            return res.send(err);
        }
    });
}
async function getFollowArticles(req, res) {
    const { user } = req;
    const followingUID = user.following;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.find({ 'userId': followingUID }).exec();
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
async function removeSavedArticle(req, res) {
    const { user } = req;
    const { id } = req.params;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    const article = await Article.findById(id);
    await User.updateOne({ username: getUser.username }, { $pull: { savearticles: article._id } },
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

    return await Article.find({ '_id': savedUID }).exec();
}
async function getById(req, res) {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article)
        return res.sendStatus(404).send("NOT_FOUND")
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
    if (!article)
        return res.sendStatus(404).send("NOT_FOUND")
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");
    if (getUser._id != article.userId)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.findByIdAndUpdate(id, body, { new: true })
}
async function deletbyId(req, res) {
    const { params: { id } } = req;
    const { user } = req;
    const getUser = await User.findById(user._id);
    const article = Article.findById(id);
    if (!article)
        return res.sendStatus(404).send("NOT_FOUND")
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");
    if (getUser._id != article.userId)
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
    const { title, author, tags, page, limit } = req.query;
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    const options = {
        page: page || 1,
        limit: limit || 10,
        sort: { createdAt: -1 }
    }
    const query = {};
    if (title) {
        query = { 'title': { "$regex": title } };

    } else if (author) {
        query = { 'author': author }

    } else if (tags) {
        query = { 'tags': tags }
    }
    return await Article.paginate(query, options).then((result) => {
        return result;
    }).catch((err) => {
        if (err) {
            return res.send(err);
        }
    });
}

async function doLike(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const getUser = await User.findById(user._id);
    const userId = getUser._id;
    const article = Article.findById(id);
    if (!article)
        return res.sendStatus(404).send("NOT_FOUND")
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
    const article = Article.findById(id);
    if (!article)
        return res.sendStatus(404).send("NOT_FOUND")
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.updateOne({ _id: id }, { $pull: { likes: userId } },
        function (err, result) {
            if (err) {
                res.send(err);
            }
        });
}
async function likesCount(req, res) {
    const { params: { id } } = req;
    const article = await Article.findById(id);
    if (!article)
        return res.sendStatus(404).send("NOT_FOUND")
    const likes = article.likes;
    return likes.length;
}
async function comment(req, res) {
    const { user } = req;
    const { params: { id } } = req;
    const { body: { comment } } = req;
    const userId = user._id;
    const getUser = await User.findById(userId);
    const article = Article.findById(id);
    if (!article)
        return res.sendStatus(404).send("NOT_FOUND")
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
    getBlogs,
    getById,
    editbyId,
    deletbyId,
    searchBy,
    doLike,
    unLike,
    likesCount,
    comment,
    getSavedArticles,
    saveArticle,
    removeSavedArticle,
    getFollowArticles,
    getMyArticles
}
