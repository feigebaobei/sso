// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
import * as createError from 'http-errors'
import * as express from 'express'
import * as path from 'path'
import * as cookieParser from 'cookie-parser'
import * as logger from 'morgan'
// import fs from 'fs'
// import * as fs from 'node:fs';
// import * as rfs from 'rotating-file-stream'

import type { Request, Response, Express, NextFunction } from "express";

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
import indexRouter from './routes/index';
import usersRouter from './routes/users';

var app: Express = express.default();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');

app.use(logger.default('dev'));
// logger.token('reqBody', (req) => {
//   return JSON.stringify(req.body)
// })
// logger.token('resBody', (_req, res) => {
//   console.log('response', res, res.body)
//   return JSON.stringify(res.body)
// })
// let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
// app.use(logger.default(':method :url :status :reqBody :resBody'));
// app.use(logger.default('div', {stream: accessLogStream}))
// app.use(logger.default('dev', {
//   stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
// }))
// var accessLogStream = rfs.createStream('access.log', {
//   interval: '1d', // rotate daily
//   path: path.join(__dirname, 'log')
// })
// app.use(logger.default('dev', {
//   stream: accessLogStream
// }))

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
