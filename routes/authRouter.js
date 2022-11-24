import express from 'express';
import googleOauthHandler, {
  refreshAccessTokenHandler,
  logout,
} from './controller/authController.js';

const router = express.Router();

router.get('/refresh', refreshAccessTokenHandler);

router.get('/google', googleOauthHandler);

router.post('/logout', logout);

export default router;
