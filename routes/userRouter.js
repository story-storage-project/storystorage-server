import express from 'express';
import getMeHandler from './controller/userController.js';
import verifyAuth from './middleware/verifyAuth.js';

const router = express.Router();

router.get('/me', verifyAuth, getMeHandler);

export default router;
