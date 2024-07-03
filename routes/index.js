const express = require('express');
const { logger } = require('../helper/log')
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  logger.info('hi')
  res.render('index', { title: 'sso' });
});

module.exports = router;
