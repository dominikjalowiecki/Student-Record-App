import express from 'express';
import { fileURLToPath } from 'url';
import path from 'node:path';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import config from './config.mjs';
import trimRequestData from './middlewares/trimRequestData.mjs';

import coursesRouter from './routes/courses.mjs';
import gradesRouter from './routes/grades.mjs';
import gradeTypesRouter from './routes/gradeTypes.mjs';
import presencesRouter from './routes/presences.mjs';
import studentsRouter from './routes/students.mjs';
import subjectsRouter from './routes/subjects.mjs';
import usersRouter from './routes/users.mjs';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');

app.use(
  cors({
    origins: ['http://localhost'],
  })
);
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use(
  logger('dev', {
    skip: function (req, res) {
      return config.production ? res.statusCode < 400 : false;
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(trimRequestData);

app.get('/', function (req, res) {
  res.render('pages/index.ejs');
});

app.get('/sign-in', function (req, res) {
  res.render('pages/signIn.ejs');
});

app.get('/sign-out', function (req, res) {
  res.render('pages/signOut.ejs');
});

app.get('/profile', function (req, res) {
  res.render('pages/profile.ejs');
});

app.get('/users', function (req, res) {
  res.render('pages/users.ejs');
});

app.get('/subjects', function (req, res) {
  res.render('pages/subjects.ejs');
});

app.get('/courses', function (req, res) {
  res.render('pages/courses.ejs');
});

app.get('/students', function (req, res) {
  res.render('pages/students.ejs');
});

app.get('/gradeTypes', function (req, res) {
  res.render('pages/gradeTypes.ejs');
});

app.use('/api/courses', coursesRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/grade-types', gradeTypesRouter);
app.use('/api/presences', presencesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/users', usersRouter);

app.use('*', express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  next(createError(404, 'Nie znaleziono żądanego zasobu'));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.status) {
    res.status(Number(err.status)).json({
      message: err.message,
    });
  } else {
    res.status(500).json({
      message: 'Wystąpił wewnętrzny błąd serwera',
    });
  }
});

export default app;
