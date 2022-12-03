/* eslint-disable no-underscore-dangle */
import httpMocks from 'node-mocks-http';
// import { jest } from '@jest/globals';
import User from '../../models/User.js';
import {
  logout,
  refreshAccessTokenHandler,
  googleOauthHandler,
  logoutCookieOptions,
} from '../../routes/controller/authController.js';
import newUser from '../mockData/user.json';
import * as jwtUtil from '../../utils/jwt.js';
import * as googleServiceFunction from '../../service/authService.js';
import signin from '../../service/userService.js';

jest.mock('../../models/User.js');
jest.mock('../../models/Story.js');
jest.mock('../../utils/jwt.js');
jest.mock('../../service/authService.js');
jest.mock('../../service/userService.js');

let req;
let res;
let next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('authController - logout', () => {
  beforeEach(() => {
    res.cookie = jest.fn();
  });
  it('should have a logout function', () => {
    expect(typeof logout).toBe('function');
  });

  it('should set as cookie initialization option', () => {
    logout(req, res, next);

    expect(res.cookie).toBeCalledWith('refreshToken', '', logoutCookieOptions);
    expect(res.cookie).toBeCalledWith('accessToken', '', logoutCookieOptions);
    expect(res.cookie).toBeCalledWith('loggedIn', '', logoutCookieOptions);
  });

  it('should return response with status 200 and success result as json', async () => {
    const data = {
      result: 'success',
    };

    logout(req, res, next);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toStrictEqual(data);
  });
});

let message;
describe('authController - refreshAccessTokenHandler', () => {
  beforeEach(() => {
    message = 'Could not refresh access token';
  });
  it('should have a refreshAccessTokenHandler function', () => {
    expect(typeof refreshAccessTokenHandler).toBe('function');
  });

  it('should decode refresh token in request cookies', async () => {
    req = {
      cookies: {
        refreshToken: 'refreshToken',
      },
    };

    jwtUtil.verifyJwt.mockImplementation(() => 'hi');

    await refreshAccessTokenHandler(req, res, next);
    expect(jwtUtil.verifyJwt).toBeCalledTimes(1);
  });

  it('if there is no token, should call next function', async () => {
    req = {
      cookies: {
        refreshToken: null,
      },
    };

    await refreshAccessTokenHandler(req, res, next);
    expect(next).toBeCalledTimes(1);
  });

  it('if there is no decoded value, should call next function', async () => {
    req = {
      cookies: {
        refreshToken: 'refreshToken',
      },
    };

    jwtUtil.verifyJwt.mockImplementation(() => null);
    const error = new Error(message);

    await refreshAccessTokenHandler(req, res, next);
    expect(next).toBeCalledWith(error);
  });

  it('if there is decoded value, should call User.findById', async () => {
    req = {
      cookies: {
        refreshToken: 'refreshToken',
      },
    };

    jwtUtil.verifyJwt.mockImplementation(() => ({ sub: 'id' }));

    await refreshAccessTokenHandler(req, res, next);
    expect(User.findById).toBeCalledWith('id');
  });

  it('if there is no user data, should call next function', async () => {
    req = {
      cookies: {
        refreshToken: 'refreshToken',
      },
    };

    jwtUtil.verifyJwt.mockImplementation(() => ({ sub: 'id' }));

    User.findById.mockReturnValue(null);
    const error = new Error(message);

    await refreshAccessTokenHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('if there is user data, should call signJwt function', async () => {
    req = {
      cookies: {
        refreshToken: 'refreshToken',
      },
    };

    User.findById.mockReturnValue(newUser);

    await refreshAccessTokenHandler(req, res, next);
    expect(jwtUtil.signJwt).toBeCalledTimes(1);
  });

  it('should handle errors', async () => {
    req = {
      cookies: {
        refreshToken: 'refreshToken',
      },
    };
    const errorMessage = { message: 'Bad Request' };
    const rejectedPromise = Promise.reject(errorMessage);

    User.findById.mockReturnValue(rejectedPromise);

    await refreshAccessTokenHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });
});

let tokens;
describe('authController - googleOauthHandler', () => {
  beforeEach(() => {
    tokens = {
      id_token: 'idToken',
      access_token: 'accessToken',
    };
  });
  it('should have a googleOauthHandler function', () => {
    expect(typeof googleOauthHandler).toBe('function');
  });

  it('if there is no code, should call next function with error message', async () => {
    req = {
      query: {},
    };
    const errorMessage = 'Authorization code not provided!';
    const error = new Error(errorMessage);

    await googleOauthHandler(req, res, next);

    expect(next).toBeCalledWith(error);
  });

  it('should call getGoogleOauthToken function with code', async () => {
    req = {
      query: { code: 'code' },
    };

    const { code } = req.query;

    await googleOauthHandler(req, res, next);

    expect(googleServiceFunction.getGoogleOauthToken).toBeCalledWith({ code });
  });

  it('should call getGoogleUser function with idToken and accessToken', async () => {
    req = {
      query: { code: 'code' },
    };

    googleServiceFunction.getGoogleOauthToken.mockReturnValue(tokens);

    await googleOauthHandler(req, res, next);

    expect(googleServiceFunction.getGoogleUser).toBeCalledWith(
      tokens.id_token,
      tokens.access_token,
    );
  });

  it('if there is no verified email, should call next function with error message', async () => {
    req = {
      query: { code: 'code' },
    };

    googleServiceFunction.getGoogleOauthToken.mockReturnValue(tokens);
    googleServiceFunction.getGoogleUser.mockReturnValue(newUser);

    const errorMessage = 'Google account not verified';
    const error = new Error(errorMessage);

    await googleOauthHandler(req, res, next);

    expect(next).toBeCalledWith(error);
  });

  it('should call signin function', async () => {
    req = {
      query: { code: 'code' },
    };

    googleServiceFunction.getGoogleOauthToken.mockReturnValue(tokens);
    googleServiceFunction.getGoogleUser.mockReturnValue({
      ...newUser,
      verified_email: 'verified_email',
    });

    await googleOauthHandler(req, res, next);

    expect(signin).toBeCalledTimes(1);
  });
});
