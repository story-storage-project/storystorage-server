/* eslint-disable no-underscore-dangle */
import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';
import Story from '../../models/Story.js';
import {
  createStory,
  deleteStory,
  patchStory,
} from '../../routes/controller/storyController.js';
import newUser from '../mockData/user.json';
import newStory from '../mockData/story.json';
import incorrectStory from '../mockData/incorrectStory.json';

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

describe('storyController - createStory', () => {
  beforeEach(() => {
    res.locals = newUser;
    Story.create = jest.fn();
  });
  it('should have a getUserAllstories function', () => {
    expect(typeof createStory).toBe('function');
  });

  it('should call a create method', async () => {
    req.body = newStory;
    await createStory(req, res, next);

    expect(Story.create).toBeCalledTimes(1);
  });

  it('should return response with status 200 and found documents as json', async () => {
    req.body = newStory;

    Story.create.mockReturnValue(newStory);

    const { user } = newUser;
    user.save = jest.fn();

    await createStory(req, res, next);

    const data = {
      data: newStory,
    };

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toStrictEqual(data);
  });

  it('should be thrown if the data is incorrect.', async () => {
    req.body = incorrectStory;
    const errorMessage = { message: 'Bad Request' };
    const rejectedPromise = Promise.reject(errorMessage);

    Story.create.mockReturnValue(rejectedPromise);

    const { user } = newUser;
    user.save = jest.fn();

    await createStory(req, res, next);

    expect(next).toHaveBeenCalledWith(errorMessage);
  });
});

describe('storyController - deleteStory', () => {
  beforeEach(() => {
    res.locals = newUser;
    Story.deleteOne = jest.fn();
  });
  it('should have a deleteStory function', () => {
    expect(typeof deleteStory).toBe('function');
  });

  it('should call a deleteOne method', async () => {
    req.params = { storyId: '6382e288e3b1623a23e22ce7' };
    await deleteStory(req, res, next);

    expect(Story.deleteOne).toBeCalledTimes(1);
  });

  it('should be throw if the params is incorrect', async () => {
    const error = new Error('Bad Request');

    await deleteStory(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return response with status 204 and success result as json', async () => {
    req.params = { storyId: '6382e288e3b1623a23e22ce7' };

    const { user } = newUser;
    user.save = jest.fn();

    await deleteStory(req, res, next);

    const data = {
      result: 'success',
    };

    expect(res._getStatusCode()).toBe(204);
    expect(res._getJSONData()).toStrictEqual(data);
  });

  it('should be throw error if the data is incorrect.', async () => {
    req.params = { storyId: '6382e288e3b1623a23e22ce7' };
    const { user } = newUser;
    user.save = jest.fn();

    const errorMessage = { message: 'Bad Request' };
    const rejectedPromise = Promise.reject(errorMessage);

    Story.deleteOne.mockReturnValue(rejectedPromise);

    await deleteStory(req, res, next);

    expect(next).toHaveBeenCalledWith(errorMessage);
  });
});

describe('storyController - patchStory', () => {
  beforeEach(() => {
    res.locals = newUser;
    Story.findByIdAndUpdate = jest.fn();
  });
  it('should have a patchStory function', () => {
    expect(typeof patchStory).toBe('function');
  });

  it('should call a deleteOne method', async () => {
    req.params = { storyId: '6382e288e3b1623a23e22ce7' };
    req.body = newStory;

    await patchStory(req, res, next);

    expect(Story.findByIdAndUpdate).toBeCalledTimes(1);
  });

  it('should be throw error if the params is incorrect', async () => {
    const error = new Error('Bad Request');

    await patchStory(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return response with status 201 and success result as json', async () => {
    req.params = { storyId: '6382e288e3b1623a23e22ce7' };
    req.body = newStory;

    Story.findByIdAndUpdate.mockImplementationOnce(() => ({
      lean: jest.fn().mockReturnValue(newStory),
    }));

    await patchStory(req, res, next);

    const data = {
      data: newStory,
    };

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toStrictEqual(data);
  });

  it('should handle errors', async () => {
    req.params = { storyId: '6382e288e3b1623a23e22ce7' };
    req.body = newStory;

    const error = new Error('Bad Request');

    Story.findByIdAndUpdate.mockImplementationOnce(() => ({
      lean: jest.fn().mockReturnValue(undefined),
    }));

    await patchStory(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
