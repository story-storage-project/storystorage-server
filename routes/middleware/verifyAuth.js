import AppError from '../../utils/appErrors.js';
import { verifyJwt } from '../../utils/jwt.js';
import User from '../../models/User.js';

const verifyAuth = async (req, res, next) => {
  try {
    let accessToken;

    if (req.cookies.accessToken) {
      accessToken = req.cookies.accessToken;
    }

    if (!accessToken) {
      return next(new AppError('You are not logged in', 401));
    }

    const decoded = verifyJwt(accessToken, 'accessTokenPublicKey');

    const { sub: decodedId } = decoded;

    if (!decoded) {
      return next(new AppError(`Invalid token or user doesn't exist`, 401));
    }

    const user = await User.findById(decodedId).populate('elementList');

    if (!user) {
      return next(new AppError(`User with that token no longer exist`, 401));
    }

    res.locals.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
};

export default verifyAuth;
