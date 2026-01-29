const express = require('express');
const cors = require('./cors')
const md5 = require('md5')
const {ulid} = require('ulid')
let {usersDb} = require('../mongodb') // todo
let {rules, createToken, verifyAccessToken,
  createVerifycationCode,
} = require('../helper')
let { deletedDuration, verificationExpiredTime } = require('../helper/config')
let { errorCode } = require('../helper/errorCode')
let { send } = require('../helper/sendEmail')
let { logger} = require('../helper/log')

let clog = console.log
let router = express.Router();

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
  new Promise((s, j) => {
    if (rules.required(req.body.email) && rules.required(req.body.password) &&
    rules.required(req.body.verification)
    ) {
      s(true)
    } else {
      j(100100)
    }
  }).then(() => {
    return usersDb.collection('users').findOne({'profile.email': req.body.email}).then((user) => {
      if (user) {
        return Promise.reject(100120)
      } else {
        return true
      }
    })
  }).then(() => {
    return usersDb.collection('verification_code').findOne({'email': req.body.email}).then((obj) => {
      // clog('obj', obj)
      if (obj?.code === req.body.verification) {
        if (new Date().getTime() < obj?.expiredTime) {
          return true
        } else {
          return Promise.reject(100164)
        }
      } else {
        return Promise.reject(100160)
      }
    })
  }).then(() => {
    let _ulid = ulid()
    return usersDb.collection('users').insertOne({
      id: _ulid,
      profile: {
        email: req.body.email,
        passwordHash: md5(req.body.password),
      },
      systems: [],
    }).then(() => {
      return res.status(200).json({
        code: 0,
        message: errorCode[0],
        data: {
          ulid: _ulid,
          profile: {
            email: req.body.email,
          },
          systems: [],
          roles: [],
          routes: [],
        }
      })
    })
  }).catch((code) => {
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

// 登录
router.route('/login')
.options(cors.corsWithOptions, (req, res) => {
  logger.info(req)
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
  clog('login')
  new Promise((s, j) => {
    if (rules.required(req.body.email) && rules.required(req.body.password)) {
      s(true)
    } else {
      j(100100)
    }
  }).then(() => {
    return usersDb.collection('users').findOne({'profile.email': req.body.email}).then(user => {
      if (!user || md5(req.body.password) !== user.profile.passwordHash) {
        return Promise.reject(100110)
      } else {
        return user
      }
    }).catch((error) => {
      return Promise.reject(200010)
    })
  }).then((user) => {
    usersDb.collection('black_list').deleteMany({userId: user.id})
    // let tokenObj = createToken(user.id)
    return res.status(200).json({
      code: 0,
      message: '',
      data: {
        // accessToken: tokenObj.accessToken,
        // refreshToken: tokenObj.refreshToken,
        ulid: user.id,
        profile: {
          email: user.profile.email,
        },
        systems: [user.systems.find((item) => item.id === req.body.systemId)],
        roles: [],
        routes: [],
      }
    })
  }).catch((code) => {
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
    let system = user.systems.find((item) => item.id === req.body.systemId)
    if (system) {
      // 取得路由信息
      let p1 = usersDb.collection('ruotes').find({id: {$in: system.route_list}}).toArray()
      // 取得角色信息
      let roleList = usersDb.collection('roles').find({id: {$in: system.role_list}}).toArray()
      let roles = []
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
  }).catch((code) => {
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
    if (rules.required(req.headers.authorization) && rules.required(req.headers.refreshToken)) {
      if (!Array.isArray(req.headers.authorization) && !Array.isArray(req.headers.refreshToken)) {
        s(true)
      } else {
        j(100150)
      }
    } else {
      j(100100)
    }
  }).then(() => {
    let p1 = verifyAccessToken((req.headers.authorization) || '')
    let p2 = verifyAccessToken((req.headers.refreshToken) || '')
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
// 未来不计划再支持token方式登录了。
// delete 20240701+
router.route('/refreshToken')
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
    if (rules.required(req.body.accessToken) && rules.required(req.body.refreshToken)) {
      s(true)
    } else {
      j(100100)
    }
  }).then(() => {
    let p1 = verifyAccessToken(req.body.accessToken)
    let p2 = verifyAccessToken(req.body.refreshToken)
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
    // clog('user', record)
    if (record) {
      return Promise.reject(100130)
    } else {
      return true
    }
  }).then(() => {
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

router.route('/saml')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.post(cors.corsWithOptions, (req, res) => {
  // res.sendStatus(200)
  // 检查参数
  // 生成saml
  // 返回值
  return new Promise((s, j) => {
    if (rules.required(req.body.email) && rules.required(req.body.password)) {
      s(true)
    } else {
      j(100100)
    }
  }).then(() => {
    return usersDb.collection('users').findOne({'profile.email': req.body.email}).then(user => {
      if (!user || md5(req.body.password) !== user.profile.passwordHash) {
        return Promise.reject(100110)
      } else {
        return user
      }
    }).catch((error) => {
      return Promise.reject(200010)
    })
  }).then((user) => {
    // usersDb.collection('black_list').deleteMany({userId: user.id})
    // let tokenObj = createToken(user.id)
    return res.status(200).json({
      code: 0,
      message: '',
      data: {
        // email: user.profile.email,
        ulid: user.id,
        profile: {
          email: user.profile.email,
        },
        systems: [],
        roles: [],
        routes: [],
      }
    })
  }).catch((code) => {
    return res.status(200).json({
      code,
      message: errorCode[code],
      data: {},
    })
  })
})
.put(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.delete(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})

// 验证码
router.route('/verification')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.post(cors.corsWithOptions, (req, res) => {
  // 验证请求体 {"email": "baobeifeige@gmail.com"}
  // 生成验证码
  // 发送邮件
  // 写入数据库表
  // 返回值
  let code = '100000'
  new Promise((s, j) => {
    if (rules.isEmail(req.body.email)) {
      s(true)
    } else {
      j(100150)
    }
  }).then(() => {
    code = createVerifycationCode(6)
    // code = String()
    return send({to: req.body.email, subject: '验证码', text: `为HeShiJade的验证码：${code}`}).then(() => {
      return true
    }).catch(() => {
      return Promise.reject(400000)
    })
  }).then(() => {
    return usersDb.collection('verification_code').updateOne({
      email: req.body.email,
    }, {
      $set: {
        email: req.body.email,
        code,
        expiredTime: new Date().getTime() + verificationExpiredTime,
      }
    }, {upsert: true}).then(() => {
      return true
    }).catch(() => {
      return Promise.reject(200000)
    })
  }).then(() => {
    res.status(200).json({
      code: 0,
      message: '',
      data: {}
    })
  }).catch((code) => {
    res.status(200).json({
      code,
      message: errorCode[code],
      data: {}
    })
  })
})
.put(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.delete(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
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

// export default router
module.exports = router;
