/* eslint-disable no-underscore-dangle */
import httpMocks from 'node-mocks-http';
// import { jest } from '@jest/globals';
import verifyAuth from '../../routes/middleware/verifyAuth.js';
import User from '../../models/User.js';
import * as jwtUtil from '../../utils/jwt.js';
import user from '../mockData/user.json';

jest.mock('../../utils/jwt.js');
jest.mock('../../models/User.js');

let req;
let res;
let next;

beforeEach(() => {
  req = httpMocks.createRequest();
  req.cookies = jest.fn();
  req.cookies.accessToken = jest.fn();
  res = httpMocks.createResponse();
  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('verifyAuth', () => {
  it('should have a verifyAuth function', () => {
    expect(typeof verifyAuth).toBe('function');
  });

  it('if there is no token, should call next function with error message', async () => {
    req = {
      cookies: {
        accessToken: null,
      },
    };

    const error = new Error('You are not logged in');

    await verifyAuth(req, res, next);

    expect(next).toBeCalledWith(error);
  });

  it('should call verifyJwt function', async () => {
    req = {
      cookies: {
        accessToken: 'accessToken',
      },
    };

    jwtUtil.verifyJwt.mockImplementation(() => ({ sub: 'id' }));

    await verifyAuth(req, res, next);

    expect(jwtUtil.verifyJwt).toBeCalledTimes(1);
  });

  it('if there is decoded value, should call next function with error message', async () => {
    req = {
      cookies: {
        accessToken: 'accessToken',
      },
    };

    const error = new Error(`Invalid token or user doesn't exist`);

    jwtUtil.verifyJwt.mockImplementation(() => null);

    await verifyAuth(req, res, next);

    expect(next).toBeCalledWith(error);
  });

  it('if there is decoded value, should call User.findById', async () => {
    req = {
      cookies: {
        accessToken: 'accessToken',
      },
    };

    jwtUtil.verifyJwt.mockImplementation(() => ({ sub: 'id' }));

    await verifyAuth(req, res, next);
    expect(User.findById).toBeCalledWith('id');
  });

  it('should handle erros', async () => {
    req = {
      cookies: {
        accessToken: 'accessToken',
      },
    };

    const errorMessage = { message: 'Internal Server Error' };
    const rejectedPromise = Promise.reject(errorMessage);

    jwtUtil.verifyJwt.mockImplementation(() => ({ sub: 'id' }));

    User.findById.mockImplementationOnce(() => ({
      populate: jest.fn().mockReturnValue(rejectedPromise),
    }));

    await verifyAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });

  it('if there is no user data, should call next function', async () => {
    req = {
      cookies: {
        accessToken: 'accessToken',
      },
    };

    jwtUtil.verifyJwt.mockImplementation(() => ({ sub: 'id' }));

    User.findById.mockImplementationOnce(() => ({
      populate: jest.fn().mockReturnValue(null),
    }));

    const error = new Error(`User with that token no longer exist`);

    await verifyAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('if there is no user data, should call next function', async () => {
    req = {
      cookies: {
        accessToken: 'accessToken',
      },
    };

    jwtUtil.verifyJwt.mockImplementation(() => ({ sub: 'id' }));

    User.findById.mockImplementationOnce(() => ({
      populate: jest.fn().mockReturnValue(user),
    }));

    await verifyAuth(req, res, next);
    expect(next).toBeCalledWith();
  });
});
