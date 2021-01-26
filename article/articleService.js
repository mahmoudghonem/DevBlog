const db = require('../helper/db');
const multer = require('multer');
const { imageFilter } = require('../helper/imageHandler');
const path = require('path');
const Article = db.Article;
const User = db.User;

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/uploads');
//     },

//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

async function create(req, res) {
    const { body, user } = req
    const getUser = await User.findById(user._id);
    if (!getUser)
        return res.sendStatus(401).send("UN_AUTHENTICATED");
    // let upload = multer({ storage: storage, fileFilter: imageFilter }).single('photo');
    // upload(req, res, function (err) {
    //     if (req.fileValidationError) {
    //      res.send(req.fileValidationError);
    //     }
    //     else if (err instanceof multer.MulterError) {
    //      res.send(err);
    //     }
    //     else if (err) {
    //      res.send(err);
    //     }
    //     if (req.file != undefined)
    //         body.photo = req.file.path;
    // });
    const article = await Article.create({ ...body, userId: getUser._id }).then((a) => {
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
    if (getUser._id != article.userId)
        return res.sendStatus(401).send("UN_AUTHENTICATED");

    return await Article.findByIdAndUpdate(id, body, { new: true })
}
async function deletbyId(req, res) {
    const { params: { id } } = req;
    const { user } = req;
    const getUser = await User.findById(user._id);
    const article = Article.findById(id);
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
    searchByTitle,
    searchByTag,
    doLike,
    unLike,
    comment,
    getFollowArticles
}
