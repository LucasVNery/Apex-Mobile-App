const express = require('express');
const router = express.Router();
const {
  getGraph,
  getMiniGraph,
  rebuildGraph,
  getStats,
} = require('../controllers/graphController');

router.get('/', getGraph);
router.get('/mini/:noteId', getMiniGraph);
router.get('/stats', getStats);
router.post('/rebuild', rebuildGraph);

module.exports = router;
