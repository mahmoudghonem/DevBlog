const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../user/userModel');
const CustomError = require('../helper/errorHandler')
const verifyJWT = promisify(jwt.verify);


// const auth = async (req, res, next) => {
//   const { authorization } = req.headers;
//   if (!authorization) return next(res.status(401).json({message : 'Invalid Token'}));
//   const token = authorization.replace('Bearer', '').trim();
//   const tokenData = await verifyJWT(token, process.env.ACCESS_TOKEN_SECERT).catch((e) => { next(new CustomError(401, 'AUTHENTICATION_REQUIRED', 'Failed to authenticate token.')) });
//   // loggedin user
//   const user = await User.findOne({ username: tokenData.username });
//   req.user = user;
//   next();

// }
const auth = async (req, res, next) => {
  const { headers: { authorization } } = req
  if (!authorization)
    next(new Error('NOT_AUTHORIZED'))
  try {
    const { id } = await verifyJWT(authorization, process.env.ACCESS_TOKEN_SECERT)
    const user = await User.findById(id).exec()
    req.user = user
    next()
  } catch (e) {
    next((new Error('NOT_AUTHORIZED')));
  }
}
module.exports = auth;