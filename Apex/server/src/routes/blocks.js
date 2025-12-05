const express = require('express');
const router = express.Router();
const {
  getBlocksByNoteId,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlock,
} = require('../controllers/blocksController');

router.get('/note/:noteId', getBlocksByNoteId);
router.post('/', createBlock);
router.put('/:id', updateBlock);
router.delete('/:id', deleteBlock);
router.patch('/:id/reorder', reorderBlock);

module.exports = router;
