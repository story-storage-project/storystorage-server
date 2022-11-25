import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import config from './config.js';
import connectDB from './db/database.js';
import routes from './routes/index.js';

const app = express();

app.use(
  cors({
    credentials: true,
    preflightContinue: true,
    origin: [config.origin],
  }),
);

app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/auth', routes.authRouter);
app.use('/user', routes.userRouter);
app.use('/users/:userId/stories', routes.storyRouter);

app.use('*', (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;

  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);

  if (res.status >= 500) {
    return res.json({ message: 'Internal Server Error' });
  }
  return res.json({ message: res.locals.message });
});

app.listen(config.serverPort, () => {
  console.log(`Server started on port: ${config.serverPort}`);

  if (process.env.NODE_ENV !== 'test') {
    connectDB();
  }
});
