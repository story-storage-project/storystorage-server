import express from 'express';
import verifyAuth from './middleware/verifyAuth.js';
import {
  createStory,
  patchStory,
  deleteStory,
} from './controller/storyController.js';

const router = express.Router();

router.use(verifyAuth);

router.post('/', createStory);

router.delete('/:storyId', deleteStory);

router.patch('/:storyId', patchStory);

export default router;
