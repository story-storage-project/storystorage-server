import express from 'express';
import Story from '../models/Story.js';

const router = express.Router();

router.get('/:id', async (req, res, next) => {
  try {
    const { id: storyId } = req.params;

    if (!storyId) {
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    const foundStory = await Story.findById(storyId).lean();

    if (!foundStory) {
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    res.status(200).json({ data: [foundStory] });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { category, name, html, css } = req.body;
    const { className, id, element } = css;

    if (!name || !category || !html || !Object.keys(css).length) {
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    const newStory = await Story.create({
      name,
      category,
      html,
      css,
    });

    newStory.cssClass = className;
    newStory.cssId = id;
    newStory.cssElement = element;

    await newStory.save();

    res.status(201).json({ data: [newStory] });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { storyId } = req.params;

    if (!storyId) {
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    await Story.deleteOne(storyId).lean();

    res.status(204);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { storyId } = req.params;

    if (!storyId) {
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    const updateData = req.body;

    const foundData = await Story.findByIdAndUpdate(storyId, updateData).lean();

    if (!foundData) {
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    res.status(200);
  } catch (error) {
    next(error);
  }
});

export default router;
