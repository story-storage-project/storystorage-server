/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import {
  getGoogleOauthToken,
  getGoogleUser,
} from '../../service/authService.js';
import config from '../../config.js';

const { google } = config;

jest.mock('../../utils/jwt.js');
jest.mock('axios');

describe('authService - getGoogleOauthToken', () => {
  it('should have a getGoogleOauthToken function', () => {
    expect(typeof getGoogleOauthToken).toBe('function');
  });

  it('should send post request to googleapis with options and headers', async () => {
    const rootURl = 'https://oauth2.googleapis.com/token';
    const codeData = { code: 'code' };

    const options = {
      code: codeData.code,
      client_id: google.clientId,
      client_secret: google.clientSecret,
      redirect_uri: google.oAuthRedirect,
      grant_type: 'authorization_code',
      withCredentials: true,
    };

    axios.post.mockImplementation(() => ({ data: 'data' }));
    await getGoogleOauthToken({ code: codeData.code });

    expect(axios.post).toBeCalledWith(rootURl, options, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  });

  it('should handle error', async () => {
    const codeData = { code: 'code' };

    const error = new Error('Internal Server Error');
    const rejectedPromise = Promise.reject(error);

    axios.post = jest.fn();
    axios.post.mockReturnValue(rejectedPromise);

    expect(async () => {
      await getGoogleOauthToken({ code: codeData.code });
    }).rejects.toThrow('Internal Server Error');
  });
});

let idToken;
let accessToken;
describe('authService - getGoogleUser', () => {
  beforeEach(() => {
    idToken = 'testIdToken';
    accessToken = 'testAccessToken';
  });
  it('should have a getGoogleUser function', () => {
    expect(typeof getGoogleUser).toBe('function');
  });

  it('should send post request to googleapis with options and headers', async () => {
    axios.get.mockImplementation(() => ({ data: 'data' }));
    await getGoogleUser(idToken, accessToken);

    expect(axios.get).toBeCalledWith(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      },
    );
  });

  it('should handle error', async () => {
    const error = new Error('Internal Server Error');
    const rejectedPromise = Promise.reject(error);

    axios.get = jest.fn();
    axios.get.mockReturnValue(rejectedPromise);

    expect(async () => {
      await getGoogleUser(idToken, accessToken);
    }).rejects.toThrow('Internal Server Error');
  });
});
