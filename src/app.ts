import * as createError from 'http-errors'
import * as express from 'express'
import * as path from 'path'
import * as cookieParser from 'cookie-parser'
// import * as logger from 'morgan'
import morganBody from 'morgan-body'
import fs from 'fs'
// import * as fs from 'node:fs';
// import * as rfs from 'rotating-file-stream'
import scheduler from './schedule'
// type/interface
import type { Request, Response, Express, NextFunction } from "express";

import indexRouter from './routes/index';
import usersRouter from './routes/users';
// import { A } from './types'

var app: Express = express.default();

scheduler()
// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');

// var accessLogStream = rfs.createStream('access.log', {
//   interval: '1d', // rotate daily
//   path: path.join(__dirname, 'log')
// })
// app.use(logger.default('dev', {
//   stream: accessLogStream
// }))

morganBody(app, {
  noColors: true,
  logRequestId:  true,
  stream: fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), {flags: 'a'})
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser.default());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
  next(createError.default(404));
});

// error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// module.exports = app;
export default app


process.on('uncaughtException', function (err) {
  console.log(err);
}); 