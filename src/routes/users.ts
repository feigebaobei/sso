// var express = require('express');
import * as express from 'express'
import cors from './cors'
import md5 from 'md5'
import jwt from 'jsonwebtoken'
import { usersDb } from '../mongodb'
import { rules, resParamsError } from '../header'
import { errorCode } from '../header/errorCode'
import { secret } from '../header/config'

let clog = console.log

var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// 登录
router.route('/login')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, (req, res) => {
  return res.status(200).json({
    code: 0,
    message: '',
    data: {}
  })
})
.post(cors.corsWithOptions, (req, res) => {
  if (rules.required(req.body.account) && rules.required(req.body.password)) {
    clog(req.body)
    usersDb.collection('users').findOne({account: req.body.account}).then((result) => {
      if (!result || md5(req.body.password) !== result.passwordHash) {
        return res.status(200).json({
          code: 100110,
          message: errorCode[100110],
          data: {},
        })
      } else {
        let accessToken = jwt.sign(result, secret)
        let refreshToken = jwt.sign(accessToken, secret)
        return res.status(200).json({
          code: 0,
          message: '',
          data: {
            result,
            accessToken,
            refreshToken,
          }
        })
      }      
    })
  } else {
    resParamsError(res)  
  }
})
.put(cors.corsWithOptions, (req, res) => {
  return res.status(200).json({
    code: 0,
    message: '',
    data: {}
  })
})
.delete(cors.corsWithOptions, (req, res) => {
  return res.status(200).json({
    code: 0,
    message: '',
    data: {}
  })
})

// module.exports = router;
export default router