import jwt from 'jsonwebtoken';
import config from '../config.js';

const { token: tokenData } = config;

export const signJwt = (payload, key) => {
  const privateKey = Buffer.from(tokenData[key], 'base64').toString('ascii');

  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
};

export const verifyJwt = (token, key) => {
  const publicKey = Buffer.from(tokenData[key], 'base64').toString('ascii');

  return jwt.verify(token, publicKey);
};
