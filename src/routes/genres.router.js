const { Router } = require('express');
const router = Router();

const {
  createGenre,
  getGenres,
} = require('../controllers/genre.controller.js');

router.get('/', getGenres);
router.post('/', createGenre);

module.exports = router;
