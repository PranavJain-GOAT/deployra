const express = require('express');
const { getMyActivities } = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, getMyActivities);

module.exports = router;
