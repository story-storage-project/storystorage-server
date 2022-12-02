import config from '../../config.js';
import {
  getGoogleOauthToken,
  getGoogleUser,
} from '../../service/sessionService.js';
import { signJwt, verifyJwt } from '../../utils/jwt.js';
import AppError from '../../utils/appErrors.js';
import User from '../../models/User.js';
import signin from '../../service/userService.js';

const { token: tokenData } = config;

const accessTokenExpiresInHour = tokenData.accessTokenExpiresIn.slice(0, -1);
const refreshTokenExpiresInDay = tokenData.accessTokenExpiresIn.slice(0, -1);

const httpsOption =
  config.nodeEnv === 'production'
    ? {
        secure: true,
        domain: 'storystorage.me',
      }
    : {};

const accessTokenCookieOptions = {
  expires: new Date(Date.now() + accessTokenExpiresInHour * 60 * 60 * 1000),
  maxAge: accessTokenExpiresInHour * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  ...httpsOption,
};

const logoutCookieOptions = {
  maxAge: 1,
  httpOnly: true,
  sameSite: 'lax',
  ...httpsOption,
};

const refreshTokenCookieOptions = {
  expires: new Date(
    Date.now() + refreshTokenExpiresInDay * 24 * 60 * 60 * 1000,
  ),
  maxAge: refreshTokenExpiresInDay * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  ...httpsOption,
};

export const logout = (req, res, next) => {
  res.cookie('refreshToken', '', logoutCookieOptions);
  res.cookie('accessToken', '', logoutCookieOptions);
  res.cookie('loggedIn', '', logoutCookieOptions);

  res.status(200).json({ result: 'success' });
};

export const refreshAccessTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    const message = 'Could not refresh access token';

    if (!refreshToken) {
      return next(new AppError(message, 403));
    }

    const decoded = verifyJwt(refreshToken, 'refreshTokenPublicKey');

    if (!decoded) {
      return next(new AppError(message, 403));
    }

    const { sub: decodedId } = decoded;

    const user = await User.findById(decodedId);

    if (!user) {
      return next(new AppError(message, 403));
    }

    const { _id: id } = user;

    const accessToken = signJwt({ sub: id }, 'accessTokenPrivateKey', {
      expiresIn: tokenData.accessTokenExpiresIn,
    });

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    return res.status(200).json({
      result: 'success',
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const googleOauthHandler = async (req, res, next) => {
  try {
    const { code } = req.query;
    const pathUrl = req.query.state || '/';

    if (!code) {
      return next(new AppError('Authorization code not provided!', 401));
    }

    const { id_token: googleIdToken, access_token: googleAccessToken } =
      await getGoogleOauthToken({ code });

    const {
      name,
      verified_email: verifiedEmail,
      email,
      picture,
    } = await getGoogleUser(googleIdToken, googleAccessToken);

    if (!verifiedEmail) {
      return next(new AppError('Google account not verified', 403));
    }

    const user = signin(name, email, picture);

    if (!user) {
      const error = new AppError('Internal Server Error');
      next(error);
    }

    const { _id: id } = user;

    const accessToken = signJwt({ sub: id }, 'accessTokenPrivateKey', {
      expiresIn: tokenData.accessTokenExpiresIn,
    });

    const refreshToken = signJwt({ sub: id }, 'refreshTokenPrivateKey', {
      expiresIn: tokenData.refreshTokenExpiresIn,
    });

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('loggedIn', true, {
      ...refreshTokenCookieOptions,
      httpOnly: false,
    });

    return res.redirect(`${config.origin}${pathUrl}`);
  } catch (error) {
    console.log('Failed to authorize Google User', error);
    return res.redirect(`${config.origin}/oauth/error`);
  }
};

export default googleOauthHandler;
