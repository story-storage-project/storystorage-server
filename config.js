import dotenv from 'dotenv';

dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
}

export default {
  nodeEnv: required('NODE_ENV'),
  serverPort: parseInt(required('PORT', 8000), 10),
  origin: required('ORIGIN'),

  db: {
    id: required('DB_ID'),
    name: required('DB_NAME'),
    password: required('DB_PASSWORD'),
    cluster: required('DB_CLUSTER'),
  },

  token: {
    accessTokenPrivateKey: required('ACCESS_TOKEN_PRIVATE_KEY'),
    accessTokenPublicKey: required('ACCESS_TOKEN_PUBLIC_KEY'),
    refreshTokenPrivateKey: required('REFRESH_TOKEN_PRIVATE_KEY'),
    refreshTokenPublicKey: required('REFRESH_TOKEN_PUBLIC_KEY'),

    accessTokenExpiresIn: required('ACCESS_TOKEN_EXPIRES_IN'),
    refreshTokenExpiresIn: required('REFRESH_TOKEN_EXPIRES_IN'),
  },

  google: {
    clientId: required('GOOGLE_OAUTH_CLIENT_ID'),
    clientSecret: required('GOOGLE_OAUTH_CLIENT_SECRET'),
    oAuthRedirect: required('GOOGLE_OAUTH_REDIRECT_URL'),
  },
};
