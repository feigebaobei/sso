// var cors = require('cors')
import * as cors from 'cors'
import type { Request, 
    // Response, Express, NextFunction
 } from "express";

let clog = console.log

var whiteList = ['http://localhost:4200', 'http://127.0.0.1:4200',
'http://localhost:4210', 'http://127.0.0.1:4210',
'http://heshijade.com:4200', 'http://heshijade.com:4210',
'http://heshijade.com:80',
]
var corsOptionDelegate = (req: Request, cb: Function) => {
  var corsOptions
    let origin = req.header('Origin') || ''
    // if (whiteList.indexOf(origin) !== -1) {
    clog('origin', origin, whiteList.indexOf(origin))
  if (true) {
    corsOptions = {
      origin: true,
      optionsSuccessStatus: 200,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      allowdHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Type', 'X-Content-Range']
    }
  } else {
    corsOptions = {origin: false}
  }
  clog('corsOptions', corsOptions)
  cb(null, corsOptions)
}

// module.exports = {
export default {
  cors: cors.default(),
  corsWithOptions: cors.default(corsOptionDelegate)
}