// const pino = require('pino')
// const path = require('path')

import pino from 'pino'
import path from 'path'

let clog = console.log

let logger = pino({
    name: 'logname',
}, pino.destination(path.resolve(`${__dirname}`, `../log/access.log`)))

export {
    pino,
    // logger,
    logger,
}