import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { accessSecret, 
    refreshSecret, accessTokenExpries, refreshTokenExpries,
    // cryptoSecretString,
    cryptoSecretBuffer,
    // ivString,
    ivBuffer,
 } from '../helper/config'
import type { Response } from 'express'
import type { S, ULID } from '../types'
import type { Buffer } from 'buffer'

let rules = {
    required: (params: any) => {
        return params !== undefined && params !== null
    },
    email: (str: string) => {
        // 1234@qq.com
        let reg = /^.*@.*\.com/
        let r = reg.test(str) 
        console.log('r', r)
        return r
    },
    isArray: (p: any) => {
        return Array.isArray(p)
    },
    isVersion: () => {
        return true
    },
    isNumber: (n: any) => {
        return typeof n === 'number' && isFinite(n);
    }
}
// let wrapCheck = (condition, res) => {
//     return new Promise((s, j) => {
//         if (condition) {
//             s()
//         } else {
//             return res.status(200).json({
//                 code: 100100,
//                 message: "请求参数错误",
//                 data: {},
//               })
//         }
//     })
// }
let resParamsError = (res: Response) => {
    return res.status(200).json({
        code: 100100,
        message: "请求参数错误",
        data: {},
      })
}
// let cryptoFn = (mt) => {
//     return mt
// }
let encode = (src: S, key: Buffer, iv: Buffer) => {
    let sign = "";
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv); // createCipher在10.0.0已被废弃
    sign += cipher.update(src, "utf8", "hex");
    sign += cipher.final("hex");
    return sign;
}
let decode = (sign: S, key: Buffer, iv: Buffer) => {
    let src = "";
    const cipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    src += cipher.update(sign, "hex", "utf8");
    src += cipher.final("utf8");
    return src;
}
let createToken = (userId: ULID) => {
    let ct = encode(JSON.stringify({userId, expires: accessTokenExpries}), cryptoSecretBuffer, ivBuffer)
    let accessToken = jwt.sign(ct, accessSecret)
    ct = encode(JSON.stringify({userId, expires: refreshTokenExpries}), cryptoSecretBuffer, ivBuffer)
    let refreshToken = jwt.sign(ct, refreshSecret)
    return {
        accessToken,
        refreshToken,
    }
}
// 待测试
let verifyAccessToken = (accessToken: S) => {
    let ct = jwt.verify(accessToken, accessSecret) as string
    // if (JwtPayload) {} else {}
    let mt = decode(ct, cryptoSecretBuffer, ivBuffer)
    let o = JSON.parse(mt)
    return {
        userId: o.userId,
        expires: o.expires,
    }
}
// 待测试
let verifyRefreshToken = (refreshToken: S) => {
    let ct = jwt.verify(refreshToken, refreshSecret) as string
    let mt = decode(ct, cryptoSecretBuffer, ivBuffer)
    let o = JSON.parse(mt)
    return {
        userId: o.userId,
        expires: o.expires,
    }
}

export {
    // required,
    rules,
    // wrapCheck,
    resParamsError,
    createToken,
    verifyAccessToken,
    verifyRefreshToken,
}