// let required = (params) => {
//     return params !== undefined && params !== null
// }
// type
import type { Response } from 'express'

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

export {
    // required,
    rules,
    // wrapCheck,
    resParamsError,
}