const express = require('express');
const router = express.Router();
const {
  getProgression,
  updateProgression,
  incrementNotes,
  getStats,
} = require('../controllers/progressionController');

router.get('/', getProgression);
router.get('/stats', getStats);
router.patch('/', updateProgression);
router.patch('/increment/notes', incrementNotes);

module.exports = router;
