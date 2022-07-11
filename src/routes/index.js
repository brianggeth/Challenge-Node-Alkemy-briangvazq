const { Router } = require('express');
const passport = require('passport');

// Importar todos los routers;
const authRouter = require('./auth.router.js');
const movieRouter = require('./movies.router.js');
const characterRouter = require('./characters.router.js');
const genreRouter = require('./genres.router.js');

const router = Router();

// Configurar los routers
router.use('/auth', authRouter);
router.use('/movies', movieRouter);

router.use(
  '/characters',
  // passport.authenticate('jwt', { session: false }),
  characterRouter
);

router.use('/genres', genreRouter);

module.exports = router;
