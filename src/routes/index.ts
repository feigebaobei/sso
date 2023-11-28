// var express = require('express');
import * as express from 'express'
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'sso' });
});

// module.exports = router;
export default router