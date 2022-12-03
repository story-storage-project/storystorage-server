/* eslint-disable no-underscore-dangle */
// import { jest } from '@jest/globals';
import User from '../../models/User.js';
import Story from '../../models/Story.js';
import newUser from '../mockData/user.json';
import newStory from '../mockData/newStory.json';
import templateIdArray from '../mockData/templateIdArray.json';
import signin from '../../service/userService.js';

jest.mock('../../models/User.js');
jest.mock('../../models/Story.js');

describe('authController - signin', () => {
  it('should have a signin function', () => {
    expect(typeof signin).toBe('function');
  });

  it('should call a findOne method', async () => {
    const { user } = newUser;
    const { name, email, picture } = user;

    await signin(name, email, picture);

    expect(User.findOne).toBeCalledTimes(1);
  });

  it('if there is no user data in the database, should call a create method', async () => {
    const { user } = newUser;
    const { name, email, picture } = user;

    User.findOne.mockReturnValue(null);

    await signin(name, email, picture);

    expect(User.create).toBeCalledTimes(1);
  });

  it('when creating a new user, should add template story id array to the list of elements in the user model and return user data', async () => {
    const { user } = newUser;
    const { _id: userId } = user;
    const { name, email, picture } = user;

    User.findOne.mockReturnValue(null);
    User.create.mockReturnValue(user);

    const storyData = {
      author: userId,
      ...newStory,
    };

    Story.create
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData)
      .mockResolvedValueOnce(storyData);

    jest.spyOn(Promise, 'all').mockImplementation();
    Promise.all.mockResolvedValueOnce(templateIdArray.arr);

    user.elementList.push = jest.fn();
    user.save = jest.fn();

    const data = await signin(name, email, picture);

    expect(user.elementList.push).toBeCalledWith(...templateIdArray.arr);
    expect(user.save).toBeCalledTimes(1);
    expect(data).toBe(user);
  });
});
