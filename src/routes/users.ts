import * as express from 'express'
import cors from './cors'
import md5 from 'md5'
import {ulid} from 'ulid'
import { usersDb } from '../mongodb'
import { rules, resParamsError, createToken, verifyAccessToken,
  isMatchedToken, } from '../helper'
import { deletedDuration} from '../helper/config'
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
    usersDb.collection('users').findOne({'profile.email': req.body.account}).then((user) => {
      if (!user) {
        let _ulid = ulid()
        usersDb.collection('users').insertOne({
          id: _ulid,
          profile: {
            email: req.body.account,
            passwordHash: md5(req.body.password),
          },
          systems: [],
        }).then(() => {
          let tokenObj = createToken(_ulid)
          return res.status(200).json({
            code: 0,
            message: errorCode[0],
            data: {
              accessToken: tokenObj.accessToken,
              refreshToken: tokenObj.refreshToken,
              id: _ulid,
              profile: {
                email: req.body.account,
              },
              systems: [],
              roles: [],
              routes: [],
            }
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
  // 校验参数
  // 取不出user
  // 删除黑名单中的数据
  // 返回用户信息+token
  new Promise((s, j) => {
    if (rules.required(req.body.account) && rules.required(req.body.password)) {
      s(true)
    } else {
      j(100100)
    }
  }).then(() => {
    usersDb.collection('users').findOne({'profile.email': req.body.account}).then(user => {
      if (!user || md5(req.body.password) !== user.profile.passwordHash) {
        return Promise.reject(100110)
      } else {
        return user
      }
    }).catch(() => {
      return Promise.reject(200010)
    })
  }).then((user: A) => {
    usersDb.collection('black_list').deleteMany({userId: user.id})
    let tokenObj = createToken(user.id)
    return res.status(200).json({
      code: 0,
      message: '',
      data: {
        accessToken: tokenObj.accessToken,
        refreshToken: tokenObj.refreshToken,
        id: user.id,
        profile: {
          email: user.profile.email,
        },
        systems: [user.systems.find((item: A) => item.id === req.body.systemId)],
        roles: [],
        routes: [],
      }
    })
  }).catch((code) => {
    return res.status(200).json({
      code,
      message: '',
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
    if (rules.required(req.body.accessToken) && rules.required(req.body.systemId)) {
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
.delete(cors.corsWithOptions, (req, res) => {
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
.post(cors.corsWithOptions, (req, res) => {
  // 校验参数
  // 2 token是否有效  能被解析
  // userId是否一致
  // 写入black_list
  new Promise((s, j) => {
    if (rules.required(req.headers.authorization) && rules.required(req.headers.refreshtoken)) {
      if (!Array.isArray(req.headers.authorization) && !Array.isArray(req.headers.refreshtoken)) {
        s(true)
      } else {
        j(100150)
      }
    } else {
      j(100100)
    }
  }).then(() => {
    let p1 = verifyAccessToken((req.headers.authorization as S) || '')
    let p2 = verifyAccessToken((req.headers.refreshtoken as S) || '')
    return Promise.all([p1, p2]).then(([r1, r2]) => {
      return [r1, r2]
    }).catch(() => {
      return Promise.reject(100140)
    })
  }).then(([r1, r2]) => {
    if (r1.userId === r2.userId) {
      let now = new Date().getTime()
      let expires = now + deletedDuration
      return usersDb.collection('black_list').insertOne({userId: r1.userId, 
        now,
        expires}).then(() => {
        return res.status(200).json({
          code: 0,
          message: '',
          data: {}
        })
      }).catch(() => {
        return Promise.reject(200000)
      })
    } else {
      return Promise.reject(100110)
    }
  }).catch((code) => {
    return res.status(200).json({
      code,
      message: errorCode[code],
      data: {}
    })
  })
})

// 刷新token
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
  // 校验参数
  // token是否一致，是否可刷新
  // 是否登出
  // 返回刷新token
  let userId = ''
  new Promise((s, j) => {
    if (rules.required(req.headers.accesstoken) && rules.required(req.headers.refreshtoken)) {
      if (!Array.isArray(req.headers.accesstoken) && !Array.isArray(req.headers.refreshtoken)) {
        s(true)
      } else {
        j(100150)
      }
    } else {
      j(100140)
    }
  }).then(() => {
    let p1 = verifyAccessToken(req.headers.accesstoken as S)
    let p2 = verifyAccessToken(req.headers.refreshtoken as S)
    return Promise.all([p1, p2]).then(([r1, r2]) => {
      if (r1.userId === r2.userId) {
        if (new Date().getTime() < r2.expires) {
          userId = r1.userId
          return true
        } else {
          return Promise.reject(100154)
        }
      } else {
        return Promise.reject(100110)
      }
    }).catch(() => {
      return Promise.reject(100140)
    })
  }).then(() => {
    // 是否登出
    return usersDb.collection('black_list').findOne({userId})
    .then((record) => {
      return record
    }).catch(() => {
      return Promise.reject(200010)
    })
  }).then((record) => {
    clog('seur', record)
    if (record) {
      return Promise.reject(100130)
    } else {
      return true
    }
  }).then(() => {
    // clog('suerdi', )
    return res.status(200).json({
      code: 0,
      message: '',
      data: createToken(userId)
    })
  }).catch(code => {
    return res.status(200).json({
      code,
      message: errorCode[code],
      data: {}
    })
  })
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