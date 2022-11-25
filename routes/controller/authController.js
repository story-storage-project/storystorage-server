import config from '../../config.js';
import {
  getGoogleOauthToken,
  getGoogleUser,
} from '../../service/session.service.js';
import { signJwt, verifyJwt } from '../../utils/jwt.js';
import AppError from '../../utils/appErrors.js';
import User from '../../models/User.js';
import Story from '../../models/Story.js';
import templates from '../../data/templates/templates.js';

const { token: tokenData } = config;

const accessTokenExpiresInHour = tokenData.accessTokenExpiresIn.slice(0, -1);
const refreshTokenExpiresInDay = tokenData.accessTokenExpiresIn.slice(0, -1);

const accessTokenCookieOptions = {
  expires: new Date(Date.now() + accessTokenExpiresInHour * 60 * 60 * 1000),
  maxAge: accessTokenExpiresInHour * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: 'true',
  domain: 'storystorage.me',
};

const logoutCookieOptions = {
  maxAge: 1,
  httpOnly: true,
  sameSite: 'lax',
  secure: 'true',
  domain: 'storystorage.me',
};

const refreshTokenCookieOptions = {
  expires: new Date(
    Date.now() + refreshTokenExpiresInDay * 24 * 60 * 60 * 1000,
  ),
  maxAge: refreshTokenExpiresInDay * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: 'true',
  domain: 'storystorage.me',
};

if (config.nodeEnv === 'production') {
  accessTokenCookieOptions.secure = true;
}

const signin = async (name, email, picture) => {
  let user = await User.findOne({ email }).lean();
  let userData = user;

  if (!user) {
    user = await User.create({ name, email, picture });

    const { _id: id } = user;

    const templateStories = await Promise.all(
      templates.map(async template => {
        const { name: temName, category, html, css } = template;
        const newStory = await Story.create({
          author: id,
          name: temName,
          category,
          html,
          css,
        });
        const { _id: storyId } = newStory;
        return storyId;
      }),
    );

    await user.elementList.push(...templateStories);
    await user.save();
    userData = await user.populate('elementList');
  }

  return userData;
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

    const decoded = verifyJwt(refreshToken, 'refreshTokenPublicKey');

    const message = 'Could not refresh access token';

    if (!decoded) {
      return next(new AppError(message, 403));
    }

    const { sub: decodedId } = decoded;

    const user = await User.findById(decodedId);

    if (!user) {
      return next(new AppError(message, 403));
    }

    const { _id: id } = user;

    const accessToken = await signJwt({ sub: id }, 'accessTokenPrivateKey', {
      expiresIn: tokenData.accessTokenExpiresIn,
    });

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('loggedIn', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    return res.status(200).json({
      result: 'success',
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

const googleOauthHandler = async (req, res, next) => {
  try {
    const { code } = req.query;
    const pathUrl = req.query.state || '/';

    if (!code) {
      return next(new Error('Authorization code not provided!', 401));
    }

    const { id_token: idToken, access_token: accessTokens } =
      await getGoogleOauthToken({ code });

    const {
      name,
      verified_email: verifiedEmail,
      email,
      picture,
    } = await getGoogleUser(idToken, accessTokens);

    if (!verifiedEmail) {
      return next(new Error('Google account not verified', 403));
    }

    const user = await signin(name, email, picture);

    if (!user) {
      const error = new Error('Internal Server Error');
      next(error);
    }

    const { _id: id } = user;

    const accessToken = await signJwt({ sub: id }, 'accessTokenPrivateKey', {
      expiresIn: tokenData.accessTokenExpiresIn,
    });

    const refreshToken = await signJwt({ sub: id }, 'refreshTokenPrivateKey', {
      expiresIn: tokenData.refreshTokenExpiresIn,
    });

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('loggedIn', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    return res.redirect(`${config.origin}${pathUrl}`);
  } catch (error) {
    console.log('Failed to authorize Google User', error);
    return res.redirect(`${config.origin}/oauth/error`);
  }
};

export default googleOauthHandler;
