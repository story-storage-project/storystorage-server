import Story from '../../models/Story.js';
import AppError from '../../utils/appErrors.js';

export const createStory = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { _id: userId } = user;

    const { category, name, html, css } = req.body;

    if (!name || !category || !html || !css) {
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    const newStory = await Story.create({
      author: userId,
      name,
      category,
      html,
      css,
    });

    const { _id: id } = newStory;

    await user.elementList.push(id);
    await user.save();

    res.status(201).json({ data: newStory });
  } catch (error) {
    next(error);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { storyId: targetId } = req.params;

    if (!targetId) {
      const error = new AppError('Bad Request');
      error.status = 400;

      next(error);
    }

    await Story.deleteOne({ _id: targetId });

    const storyIndexInUser = user.elementList.indexOf(targetId);
    await user.elementList.splice(storyIndexInUser, 1);
    await user.save();

    res.status(204).json({ result: 'success' });
  } catch (error) {
    next(error);
  }
};

export const patchStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;

    if (!storyId) {
      const error = new AppError('Bad Request');
      error.status = 400;

      next(error);
    }

    const patchData = req.body;

    const foundData = await Story.findByIdAndUpdate(storyId, patchData, {
      new: true,
    }).lean();

    if (!foundData) {
      const error = new AppError('Bad Request');
      error.status = 400;

      next(error);
    }

    res.status(201).json({ data: foundData });
  } catch (error) {
    next(error);
  }
};
