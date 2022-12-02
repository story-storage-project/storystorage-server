/* eslint-disable no-underscore-dangle */
import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';
import getMeHandler from '../../routes/controller/userController.js';
import newUser from '../mockData/user.json';

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

describe('userController - getMeHandler', () => {
  it('should have a getMeHandler function', () => {
    expect(typeof getMeHandler).toBe('function');
  });

  it('if res.locals has no data, should return response with "no data" data as json', async () => {
    res.locals = null;
    const data = {
      data: 'no data',
    };

    await getMeHandler(req, res, next);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toStrictEqual(data);
  });

  it('should return response with "user data" data as json', async () => {
    res.locals = newUser;
    const { user } = newUser;
    const data = {
      data: user,
    };

    await getMeHandler(req, res, next);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toStrictEqual(data);
  });

  it('should return response with "no data" data as json', async () => {
    res.locals = {
      user: null,
    };
    const data = {
      data: 'no data',
    };

    await getMeHandler(req, res, next);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toStrictEqual(data);
  });
});
