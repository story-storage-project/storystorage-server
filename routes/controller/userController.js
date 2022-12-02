const getMeHandler = (req, res, next) => {
  if (!res.locals) {
    return res.status(200).json({ data: 'no data' });
  }

  const { user } = res.locals;
  return user
    ? res.status(200).json({ data: user })
    : res.status(200).json({ data: 'no data' });
};

export default getMeHandler;
