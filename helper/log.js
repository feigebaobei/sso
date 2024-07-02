// import pino from 'pino'
// import path from 'path'


// var express = require('express');
// module.exports = router;

const pino = require('pino')
let clog = console.log

let logger = pino({
    name: 'logname',
}, pino.destination(path.resolve(`${__dirname}`, '../log/access.log')))

module.exports = {
    pino, logger,
}