// var express = require('express');
import * as express from 'express'
import cors from './cors'
import md5 from 'md5'
import jwt from 'jsonwebtoken'
import {ulid} from 'ulid'
import { usersDb } from '../mongodb'
import { rules, resParamsError, createToken } from '../helper'
import { errorCode } from '../helper/errorCode'
import { accessTokenExpries, refreshTokenExpries } from '../helper/config'

let clog = console.log

var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// 注册
// 待测试
router.route('/sign')
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
    usersDb.collection('users').findOne({account: req.body.account}).then((result) => {
      if (!result) {
        let _ulid = ulid()
        usersDb.collection('users').insertOne({
          profile: {
            id: _ulid,
            email: req.body.account,
            passwordHash: md5(req.body.password),
          },
          systems: [],
          roles: [],
          router: [],
        }).then(() => {
          return res.status(200).json({
            code: 0,
            message: errorCode[0],
            data: createToken(_ulid)
          })
        }).catch(() => {
          return res.status(200).json({
            code: 200000,
            message: errorCode[200000],
            data: {}
          })
        })
      } else {
        return res.status(200).json({
          code: 100120,
          message: errorCode[100120],
          data: {}
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
    usersDb.collection('users').findOne({account: req.body.account}).then((result) => {
      if (!result || md5(req.body.password) !== result.passwordHash) {
        return res.status(200).json({
          code: 100110,
          message: errorCode[100110],
          data: {},
        })
      } else {
        let accessToken = jwt.sign(result, secret, {
          expiresIn: accessTokenExpries
        })
        let refreshToken = jwt.sign(accessToken, secret, {
          expiresIn: refreshTokenExpries
        })
        return res.status(200).json({
          code: 0,
          message: '',
          data: {
            // result,
            accessToken,
            refreshToken,
            accessTokenExpries,
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

// 验证用户
router.route('/authUserInfo')
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
  if (rules.required(req.body.accessToken)) {
    let profile = jwt.verify(req.body.accessToken, secret)
    return res.status(200).json({
      code: 0,
      message: '',
      data: {
        profile,
        promission,
        router,
        accessToken,
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