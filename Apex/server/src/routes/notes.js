const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getRootNotes,
  getChildren,
  searchNotes,
  getAllTags,
} = require('../controllers/notesController');

// Rotas públicas de busca
router.get('/search', searchNotes);
router.get('/tags', getAllTags);
router.get('/roots', getRootNotes);

// Rotas de notas individuais
router.get('/:id', getNoteById);
router.get('/:id/children', getChildren);

// CRUD
router.get('/', getAllNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
