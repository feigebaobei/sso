#!/usr/bin/env node

// const path = require('path')
// const fsPromises = require('fs/promises')
// const childProcess = require('child_process')
import * as path from 'path'
import * as fsPromises from 'fs/promises'

let clog = console.log

// 若存在则删除
let logPath = path.resolve(__dirname, '../log/access.log')
fsPromises.access(
    logPath,
    fsPromises.constants.F_OK,
).then(() => {
    // 存在
    return fsPromises.unlink(logPath)
}).catch(e => {
    // 不存在
    return Promise.resolve(true)
}).then(() => {
    // 创建日志文件
    return fsPromises.writeFile(path.resolve(__dirname, '../log/access.log'), '')
})