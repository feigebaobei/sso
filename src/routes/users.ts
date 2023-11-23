// var express = require('express');
import * as express from 'express'
import cors from './cors'
import md5 from 'md5'
import jwt from 'jsonwebtoken'
import {ulid} from 'ulid'
import { usersDb } from '../mongodb'
import { rules, resParamsError, createToken, verifyAccessToken } from '../helper'
import { errorCode } from '../helper/errorCode'
// import { accessTokenExpries, refreshTokenExpries } from '../helper/config'
import type { UserDocument, A } from '../types'
// import { A } from '../types'

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
// 待测试
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
    usersDb.collection('users').findOne({email: req.body.account}).then((result) => {
      if (!result || md5(req.body.password) !== result.passwordHash) {
        return res.status(200).json({
          code: 100110,
          message: errorCode[100110],
          data: {},
        })
      } else { // 登录信息正确
        return res.status(200).json({
          code: 0,
          message: '',
          data: createToken(result.id)
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
  if (rules.required(req.body.accessToken) && rules.required(req.body.systemId)) {
    // let {userId, expires} = 
    verifyAccessToken(req.body.accessSecret).then(({userId, expires}) => {
      // 若能解码，则说明未过期
      // let now = new Date().getTime()
      // if (expires )
      return usersDb.collection('users').findOne({id: userId}).then(result => {
        if (result) {
          return result
        } else {
          return Promise.reject()
        }
      })
      // .then(result => {
      //   return res.status(200).json({
      //     code: 0,
      //     message: '',
      //     data: {
      //       profile: {
      //         email: result.email,
      //       },
      //       promission,
      //       roles: 
      //       router,
      //       // accessToken,
      //     }
      //   })
      // })
    }).then((user) => {
      // let p1 = usersDb.collection('systems').find({id: user.systems.map((item: A) => item.id)})
      // let p2 = usersDb.collection('routes').find({id: user.systems.map((item: A) => item.)})
      let system = user.systems.find((item: A) => item.id === req.body.systemId)
      if (system) {
        let p1 = usersDb.collection('routes').find({id: system.role_list}) // 取得路由信息
        // 取得角色信息
        let userList = usersDb.collection('roles').find({id: system.role_list})
        let p2 = new Promise((s, _j) => {
          let permissionsId = userList.map(item => item.permissions)
          s(usersDb.collection('permissions').find({id: permissionsId}))
        })
        Promise.all([p1, p2]).then(([r1, r2]) => {
          return res.status(200).json({
            code: 0,
            message: errorCode[0],
            data: {
              profile: {
                email: user.email,
              },
              permission: r2,
              router: r1,
            }
          })
        })
      } else {
        return res.status(200).json({
          code: 300000,
          message: errorCode[300000],
          data: {}
        })
      }
    }).catch(error => {
      return res.status(200).json({
        code: 200010,
        message: errorCode[200010],
        data: {}
      })
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