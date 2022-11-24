import Story from '../../models/Story.js';

export const getUserAllStories = async (req, res, next) => {
  try {
    const { elementList: userElementList } = res.locals.user;

    const allStories = await Story.find({ _id: userElementList });

    res.status(200).json({ data: allStories });
  } catch (error) {
    next(error);
  }
};

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

export const getStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;

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
};

export const deleteStory = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { storyId: targetId } = req.params;

    if (!targetId) {
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    await Story.deleteOne({ _id: targetId });
    await user.elementList.filter(story => {
      const { _id: userStoryId } = story;

      return userStoryId !== targetId;
    });

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
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    const patchData = req.body;

    const foundData = await Story.findByIdAndUpdate(storyId, patchData).lean();

    if (!foundData) {
      const error = new Error('Bad Request');
      error.status = 400;

      next(error);
    }

    res.status(201).json({ data: foundData });
  } catch (error) {
    next(error);
  }
};
