// var express = require('express');
import * as express from 'express'
import { logger } from '../helper/log'

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  logger.info('hi')
  res.render('index', { title: 'sso' });
});

// module.exports = router;
export default router