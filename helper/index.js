// import jwt from 'jsonwebtoken'
// import crypto from 'crypto'
// import { accessSecret, 
//     refreshSecret, 
//     accessTokenDuration, 
//     refreshTokenDuration,
//     cryptoSecretBuffer,
//     ivBuffer,
//     numberArr,
//  } from '../helper/config'

const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { accessSecret, refreshSecret, accessTokenDuration,
    refreshTokenDuration,
    cryptoSecretBuffer, ivBuffer, numberArr,
} = require('./config')

//  var express = require('express');
// module.exports = router;

let clog = console.log

let rules = {
    required: (params) => {
        return params !== undefined && params !== null
    },
    isEmail: (str) => {
        // 1234@qq.com
        let reg = /^.*@.*\.com/
        let r = reg.test(str) 
        console.log('r', r)
        return r
    },
    isArray: (p) => {
        return Array.isArray(p)
    },
    isVersion: () => {
        return true
    },
    isNumber: (n) => {
        return typeof n === 'number' && isFinite(n);
    }
}
let resParamsError = (res) => {
    return res.status(200).json({
        code: 100100,
        message: "请求参数错误",
        data: {},
      })
}
let accessTokenExpries = () => {
    return new Date().getTime() + accessTokenDuration
}
let refreshTokenExpries = () => {
    return new Date().getTime() + refreshTokenDuration
}
let encode = (src, key, iv) => {
    let sign = "";
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv); // createCipher在10.0.0已被废弃
    sign += cipher.update(src, "utf8", "hex");
    sign += cipher.final("hex");
    return sign;
}
let decode = (sign, key, iv) => {
    let src = "";
    const cipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    src += cipher.update(sign, "hex", "utf8");
    src += cipher.final("utf8");
    return src;
}
let createToken = (userId) => {
    // 先签名再加密
    let expires = accessTokenExpries()
    let mtAccessToken = jwt.sign({
        userId,
        expires,
    }, accessSecret, {
        expiresIn: accessTokenDuration
    })
    let accessToken = encode(mtAccessToken, cryptoSecretBuffer, ivBuffer)
    let mtRefreshToken = jwt.sign({
        userId,
        expires: refreshTokenExpries()
    }, refreshSecret, {
        expiresIn: refreshTokenDuration
    })
    let refreshToken = encode(mtRefreshToken, cryptoSecretBuffer, ivBuffer)
    return {
        accessToken,
        refreshToken,
    }
}

// 待测试
// 返回验签的数据
let verifyAccessToken = (accessToken) => {
    // 先解密，再验签
    // clog('accessToken', accessToken)
    return (new Promise((s, j) => {
        let mt = decode(accessToken, cryptoSecretBuffer, ivBuffer)
        jwt.verify(mt, accessSecret, (err, decoded) => {
            // clog('verifyAccessToken', err, decoded)
            if (err) {
                j(err)
            } else {
                s(decoded)
                // decoded: {
                //     userId: '01HG2CA5QQDR7MCVMQAZPZZHC7',
                //     expires: 1700888883508,
                //     iat: 1700887083,
                //     exp: 1702687083
                // }
            }
        })
    }))

// }) as Promise<{userId: S, expires: N}>)
    // return (new Promise((s, j) => {
    //     jwt.verify(accessToken, accessSecret, (err, decoded) => {
    //         if (err) {
    //             j(err)
    //         } else {
    //             s((decoded as S))
    //         }
    //     })
    // }) as Promise<S>).then((ct: S) => {
    //     let mt = decode(ct, cryptoSecretBuffer, ivBuffer)
    //     let o = JSON.parse(mt)
    //     return {
    //         userId: o.userId,
    //         expires: o.expires,
    //     }
    // })
    // 与下面的写法等效
    // let p: Promise<S> = new Promise((s, j) => {
    //     jwt.verify(accessToken, accessSecret, (err, decoded) => {
    //         if (err) {
    //             j(err)
    //         } else {
    //             s((decoded as S))
    //         }
    //     })
    // })
    // return p.then((ct: S) => {
    //     // decode()
    //     let mt = decode(ct, cryptoSecretBuffer, ivBuffer)
        
    //     let o = JSON.parse(mt)
    //     return {
    //         userId: o.userId,
    //         expires: o.expires,
    //     }
    // })
}
// 待测试
let verifyRefreshToken = (refreshToken) => {
    let ct = jwt.verify(refreshToken, refreshSecret)
    let mt = decode(ct, cryptoSecretBuffer, ivBuffer)
    let o = JSON.parse(mt)
    return {
        userId: o.userId,
        expires: o.expires,
    }
}
// 2个token是否匹配
let isMatchedToken = (accessToken, refreshToken) => {
    return Promise.all([verifyAccessToken(accessToken), verifyRefreshToken(refreshToken)]).then(([r1, r2]) => {
        return r1.userId === r2.userId
    })
}
let ceateRandom = (n) => {
    return Math.floor(Math.random() * Math.pow(10, n))
}
let createVerifycationCode = (n) => {
    // numberArr
    let res = ''
    let i = 0
    let j
    while (i < n) {
        j = ceateRandom(1)
        res += numberArr[j]
        i++
    }
    return res
}

module.exports = {
    // required,
    rules,
    // wrapCheck,
    resParamsError,
    createToken,
    verifyAccessToken,
    verifyRefreshToken,
    isMatchedToken,
    ceateRandom,
    createVerifycationCode,
}