const { Router } = require('express');
const router = Router();

const {
  createMovie,
  updateMovie,
  removeMovie,
  getMovies,
  getMovieDetails,
} = require('../controllers/movie.controller.js');

router.get('/:id', getMovieDetails);
router.post('/', createMovie);
router.put('/', updateMovie);
router.delete('/', removeMovie);

router.get('/', getMovies);

module.exports = router;
