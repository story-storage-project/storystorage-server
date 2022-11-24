import express from 'express';
import verifyAuth from './middleware/verifyAuth.js';
import {
  getStory,
  getUserAllStories,
  createStory,
  patchStory,
  deleteStory,
} from './controller/storyController.js';

const router = express.Router();

router.use(verifyAuth);

router.get('/', getUserAllStories);

router.post('/', createStory);

router.get('/:storyId', getStory);

router.delete('/:storyId', deleteStory);

router.patch('/:storyId', patchStory);

export default router;
