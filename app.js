import './connectEnv.js';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './db/database.js';

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

app.use(morgan('tiny'));
app.use(cors());

app.use(express.json());

// app.use("/users/", storyRouter);

app.use(function (req, res, next) {
  const error = new Error('Page not found');
  error.status = 404;
  error.message = 'Not Found';
  next(error);
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);

  if (req.headers['content-type'] === 'application/json') {
    res.json({
      result: 'error',
    });
  } else {
    if (res.status >= 500) {
      res.json({ message: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'error' });
  }
});

app.listen(process.env.PORT);
