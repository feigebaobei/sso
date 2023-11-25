import * as express from 'express'
import cors from './cors'
import md5 from 'md5'
import {ulid} from 'ulid'
import { usersDb } from '../mongodb'
import { rules, resParamsError, createToken, verifyAccessToken,
  isMatchedToken, } from '../helper'
import { errorCode } from '../helper/errorCode'
import type { UserDocument, A, S, N } from '../types'

let clog = console.log
var router = express.Router();

// 注册
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
    usersDb.collection('users').findOne({'profile.email': req.body.account}).then((result) => {
      if (!result) {
        let _ulid = ulid()
        usersDb.collection('users').insertOne({
          id: _ulid,
          profile: {
            email: req.body.account,
            passwordHash: md5(req.body.password),
          },
          systems: [],
        }).then(() => {
          return res.status(200).json({
            code: 0,
            message: errorCode[0],
            data: createToken(_ulid)
          })
        }).catch((error) => {
          return res.status(200).json({
            code: 200000,
            message: errorCode[200000],
            data: error
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
    usersDb.collection('users').findOne({'profile.email': req.body.account}).then((result) => {
      if (!result || md5(req.body.password) !== result.profile.passwordHash) {
        return res.status(200).json({
          code: 100110,
          message: errorCode[100110],
          data: {},
        })
      } else { // 登录信息正确
        usersDb.collection('black_list').deleteOne({userId: result.id})
        // clog('login', result)
        return res.status(200).json({
          code: 0,
          message: '',
          data: createToken(result.id)
        })
        // .then(() => {
        //   return res.status(200).json({
        //     code: 0,
        //     message: '',
        //     data: createToken(result.id)
        //   })
        // })
        // .catch(() => {
        //   return res.status(200).json({
        //     code: 200030,
        //     message: errorCode[200030],
        //     data: {}
        //   })
        // })
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
  // 检查参数
  // token是否有效
  // 是否存在指定用户
  // 是否已经登出
  // 查询相关表中的数据
  new Promise((s, j) => {
    // return 
    if (rules.required(req.body.accessToken) && rules.required(req.body.systemId)) {
      // return true
      s(true)
    } else {
      j(Promise.reject(100100))
    }
  }).then(() => {
    // token是否有效
    return verifyAccessToken(req.body.accessToken).then(({userId, _expires}) => {
      return userId
    }).catch(() => {
      return Promise.reject(100140)
    })
  }).then((userId) => {
    // 是否已经登出
    return usersDb.collection('black_list').findOne({userId}).then((record) => {
      return {record, userId}
    }).catch(() => {
      return Promise.reject(200010)
    })
    // return verifyAccessToken(req.body.accessToken).then(({userId, _expires}) => {
    //   .catch(() => {
    //     return Promise.reject(200010)
    //   })
    // })
  }).then(({record, userId}) => {
    if (record) {
      return Promise.reject(100130)
    } else {
      return userId
    }
  }).then((userId) => {
    // 查用户表
    return usersDb.collection('users').findOne({id: userId}).then(user => {
      if (user) {
        return user
      } else {
        return Promise.reject(300000)
      }
    })
  }).then((user) => {
    // 取出对应的系统
    let system = user.systems.find((item: A) => item.id === req.body.systemId)
    if (system) {
      // 取得路由信息
      let p1 = usersDb.collection('ruotes').find({id: {$in: system.route_list}}).toArray()
      // 取得角色信息
      let roleList = usersDb.collection('roles').find({id: {$in: system.role_list}}).toArray()
      let roles: A = []
      // 取得所有权限信息
      let p2 = roleList.then((list) => {
        roles = list
        let permissionIds = list.map(item => item.permissions)
        return usersDb.collection('permissions').find({id: {$in: permissionIds}}).toArray()
      })
      return Promise.all([p1, p2]).then(([r1, r2]) => {
        return res.status(200).json({
          code: 0,
          message: '',
          data: {
            profile: {
              email: user.email
            },
            permission: r2,
            router: r1,
            roles,
          }
        })
      }).catch(() => {
        return Promise.reject(200010)
      })
    } else {
      return Promise.reject(100110)
    }
  }).catch((code: N) => {
    return res.status(200).json({
      code,
      message: errorCode[code],
      data: {}
    })
  })
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

// 登出
router.route('/logout')
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
  return res.status(200).json({
    code: 0,
    message: '',
    data: {}
  })
})
.put(cors.corsWithOptions, (req, res) => {
  return res.status(200).json({
    code: 0,
    message: '',
    data: {}
  })
})
.delete(cors.corsWithOptions, (req, res) => {
  // clog('sdfs', req.headers, req.headers.authorization, req.headers.refreshtoken)
  // express框架的header字段都是小写
  if (rules.required(req.headers.authorization) && rules.required(req.headers.refreshtoken)) {
    // clog('req', req.headers.authorization, req.headers.refreshtoken)
    if (!Array.isArray(req.headers.authorization) && !Array.isArray(req.headers.refreshtoken)) {
      // 2 token是否有效  能被解析
      // userId一致
      // black_list中不存在
      // 
      let p1 = verifyAccessToken((req.headers.authorization as S) || '')
      let p2 = verifyAccessToken((req.headers.refreshtoken as S) || '')
      Promise.all([p1, p2]).then(([r1, r2]) => {
        clog(r1, r2)
        if (r1.userId === r2.userId) {
          usersDb.collection('black_list').findOne({userId: r1.userId}).then((result) => {
            if (result) {
              return res.status(200).json({
                code: 100130,
                message: errorCode[100130],
                data: {}
              })
            } else {
              usersDb.collection('black_list').insertOne({userId: r1.userId, expires: new Date().getTime()}).then(() => {
                return res.status(200).json({
                  code: 0,
                  message: '',
                  data: {}
                })
              })
            }
          })
        } else {
          return res.status(200).json({
            code: 100110,
            message: errorCode[100110],
            data: {}
          })
        }
      }).catch((error) => {
        return res.status(200).json({
          code: 100140,
          message: errorCode[100140],
          data: {}
        })
      })
    } else {
      return res.status(200).json({
        code: 100100,
        message: errorCode[100100],
        data: {}
      })
    }
  } else {
    resParamsError(res)
  }
})

// 刷新token
// 待测试
router.route('/refreshtoken')
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
  return res.status(200).json({
    code: 0,
    message: '',
    data: {}
  })
})
.put(cors.corsWithOptions, (req, res) => {
  if (rules.required(req.body.accessToken) && rules.required(req.body.refreshtoken)) {
    let userId = ''
    verifyAccessToken(req.body.accessToken).then(({userId:_u, expires}) => {
      userId = _u
      return usersDb.collection('black_list').findOne({userId})
    }).then((record) => {
      if (record) { // 有记录
        return res.status(200).json({
          code: 100130,
          message: errorCode[100130],
          data: {}
        })
      } else { // 无记录
        isMatchedToken(req.body.accessToken, req.body.refreshtoken).then((b) => {
          if (b) {
            return res.status(200).json({
              code: 0,
              message: '',
              data: createToken(userId)
            })
          } else {
            return res.status(200).json({
              code: 100114,
              message: errorCode[100114],
              data: {}
            })
          }
        })
      }
    })
  } else {
    resParamsError(res)
  }
})
.delete(cors.corsWithOptions, (req, res) => {
  return res.status(200).json({
    code: 0,
    message: '',
    data: {}
  })
})


// 重置用户表
// 开发时使用
// router.route('/reset')
// .options(cors.corsWithOptions, (req, res) => {
//   res.sendStatus(200)
// })
// .get(cors.corsWithOptions, (req, res) => {
//   return res.status(200).json({
//     code: 0,
//     message: '',
//     data: {}
//   })
// })
// .post(cors.corsWithOptions, (req, res) => {
//   return res.status(200).json({
//     code: 0,
//     message: '',
//     data: {}
//   })
// })
// .put(cors.corsWithOptions, (req, res) => {
//   return res.status(200).json({
//     code: 0,
//     message: '',
//     data: {}
//   })
// })
// .delete(cors.corsWithOptions, (req, res) => {
//   usersDb.collection('users').deleteMany({id: {$nin: ['01HG0NKFWWDE0E1939713W0EP9']}})
//   return res.status(200).json({
//     code: 0,
//     message: '',
//     data: {}
//   })
// })

export default router