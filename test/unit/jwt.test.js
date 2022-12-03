/* eslint-disable no-underscore-dangle */
import jwt from 'jsonwebtoken';
import { signJwt, verifyJwt } from '../../utils/jwt.js';
import user from '../mockData/user.json';

jest.mock('jsonwebtoken');

beforeEach(() => {
  jest.spyOn(Buffer, 'from').mockImplementation();
  Buffer.from.mockResolvedValueOnce('privateKey');
});

describe('jwt - signJwt', () => {
  it('should have a signJwt function', () => {
    expect(typeof signJwt).toBe('function');
  });

  it('should call jwt.sign function', () => {
    Buffer.from.mockResolvedValueOnce('privateKey');
    signJwt(user._id, 'accessToken');

    expect(jwt.sign).toBeCalledTimes(1);
  });
});

describe('jwt - verifyJwt', () => {
  it('should have a verifyJwt function', () => {
    expect(typeof verifyJwt).toBe('function');
  });

  it('should call jwt.sign function', () => {
    Buffer.from.mockResolvedValueOnce('privateKey');
    verifyJwt('token', 'accessToken');

    expect(jwt.verify).toBeCalledTimes(1);
  });
});
