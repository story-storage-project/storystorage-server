import jwt from 'jsonwebtoken';
import config from '../config.js';

const { token: tokenData } = config;

export const signJwt = (payload, key) => {
  try {
    const privateKey = Buffer.from(tokenData[key], 'base64').toString('ascii');

    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  } catch (error) {
    return null;
  }
};

export const verifyJwt = (token, key) => {
  try {
    const publicKey = Buffer.from(tokenData[key], 'base64').toString('ascii');

    return jwt.verify(token, publicKey);
  } catch (error) {
    console.log(error);
    return null;
  }
};
