import User from '../models/User.js';
import Story from '../models/Story.js';
import templates from '../data/templates/templates.js';

const signin = async (name, email, picture) => {
  try {
    let userData = await User.findOne({ email });

    if (!userData) {
      userData = await User.create({ name, email, picture });

      const { _id: id } = userData;

      const templateStories = await Promise.all(
        templates.map(async template => {
          const { name: temName, category, html, css } = template;
          const newStory = await Story.create({
            author: id,
            name: temName,
            category,
            html,
            css,
          });
          const { _id: storyId } = newStory;

          return storyId;
        }),
      );

      userData.elementList.push(...templateStories);
      await userData.save();
    }

    return userData;
  } catch (error) {
    return error;
  }
};

export default signin;
