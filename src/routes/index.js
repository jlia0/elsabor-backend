const express = require('express');
const meta = require('../../package.json');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => res.send({ version: meta.version }));

module.exports = router;
