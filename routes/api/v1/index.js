const express = require('express');

const router = express.Router();

const indexHandler = require('../../../handlers/indexHandler');

/* GET home page. */
router.get('/', indexHandler.homepage);

module.exports = router;
