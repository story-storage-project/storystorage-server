import axios from 'axios';
import config from '../config.js';
import AppError from '../utils/appErrors.js';

const { google } = config;

export const getGoogleOauthToken = async ({ code }) => {
  const rootURl = 'https://oauth2.googleapis.com/token';

  const options = {
    code,
    client_id: google.clientId,
    client_secret: google.clientSecret,
    redirect_uri: google.oAuthRedirect,
    grant_type: 'authorization_code',
    withCredentials: true,
  };

  try {
    const { data } = await axios.post(rootURl, options, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return data;
  } catch (error) {
    throw new AppError(error);
  }
};

export async function getGoogleUser(idToken, accessToken) {
  try {
    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      },
    );

    return data;
  } catch (error) {
    throw new AppError(error);
  }
}
