const { Character, Movie, Genre } = require('../db.js');

//#############################################################################
// Create a new movie
//#############################################################################
const createMovie = async (req, res) => {
  const { image, name, date, score } = req.body;

  if (
    !image.match(/^(http|https):\/\//) ||
    !image.match(/\.(jpeg|jpg|gif|png)$/)
  ) {
    return res.status(400).json({
      error: 'Image must be a valid url',
    });
  }

  if (!name || !date || !score) {
    return res.status(400).json({
      error: 'Name, date and score are required',
    });
  }

  if (score < 0 || score > 5) {
    return res.status(400).json({
      error: 'Score must be between 0 and 5',
    });
  }

  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return res.status(400).json({
      error: 'Date must be in the format YYYY-MM-DD',
    });
  }

  const [movie, created] = await Movie.findOrCreate({
    where: { title: name },
    defaults: {
      title: name,
      image,
      date,
      score,
    },
  });

  if (!created) {
    return res.status(400).json({
      error: 'Movie already exists',
    });
  }

  res.status(201).json({ message: 'Movie created' });
};

//#############################################################################
//Update a movie && Add a genre or a character to a movie
//#############################################################################
const updateMovie = async (req, res) => {
  const { id } = req.query;

  const { image, name, score, date, characters, genres } = req.body;

  if (!id) {
    return res.status(400).json({
      error: 'Id is required',
    });
  }

  if (image) {
    if (
      !image.match(/^(http|https):\/\//) ||
      !image.match(/\.(jpeg|jpg|gif|png)$/)
    ) {
      return res.status(400).json({
        error: 'Image must be a valid url',
      });
    }
  }

  if (score) {
    if (score < 0 || score > 5) {
      return res.status(400).json({
        error: 'Score must be between 0 and 5',
      });
    }
  }

  if (date) {
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({
        error: 'Date must be in the format YYYY-MM-DD',
      });
    }
  }

  const movie = await Movie.findByPk(id);

  if (!movie) {
    return res.status(404).json({
      error: 'Movie not found',
    });
  }

  movie.update({
    image,
    name,
    score,
    date,
  });

  if (characters) {
    for (const char of characters) {
      const characterInstance = await Character.findOne({
        where: { id: char },
      });

      if (!characterInstance) {
        return res.status(400).json({
          error: 'Character not found',
          char,
        });
      }

      await movie.addCharacter(characterInstance);
    }
  }

  if (genres) {
    for (const genre of genres) {
      const genreInstance = await Genre.findOne({
        where: { id: genre },
      });

      if (!genreInstance) {
        return res.status(400).json({
          error: 'Genre not found',
          genre,
        });
      }

      await movie.addGenre(genreInstance);
    }
  }

  const genrees = await movie.getGenres();
  const characterss = await movie.getCharacters();

  res.status(200).send({ movie, genrees, characterss });
};

// #############################################################################
// Remove a movie
// #############################################################################
const removeMovie = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      error: 'Id is required',
    });
  }

  const movie = await Movie.findByPk(id);

  if (!movie) {
    return res.status(404).json({
      error: 'Movie not found',
    });
  }

  movie.destroy();
  res.status(200).send({ msg: 'Movie deleted' });
};

//#############################################################################
// Get all movies, filtered by name or genre, sorted by date ascending or descending
//#############################################################################
const getMovies = async (req, res) => {
  const { name, genre, order } = req.query;

  let movies;

  if (name) {
    movies = await Movie.findAll({
      where: { title: name },
    });
  }

  if (genre) {
    const genreInstance = await Genre.findOne({
      where: { id: genre },
    });

    if (!genreInstance) {
      return res.status(400).json({
        error: 'Genre not found',
      });
    }

    movies = await genreInstance.getMovies();
  }

  if (!name && !genre) {
    movies = await Movie.findAll();
  }

  if (order) {
    if (order === 'ASC') {
      movies = movies.sort((a, b) => a.date - b.date);
    } else {
      movies = movies.sort((a, b) => b.date - a.date);
    }
  }

  if (movies.lenght === 0) {
    return res.status(404).json({
      error: 'No movies found',
    });
  }

  movies = movies.map((movie) => {
    return {
      title: movie.title,
      image: movie.image,
    };
  });

  res.status(200).json(movies);
};

//#############################################################################
// Get a movie by id
//#############################################################################
const getMovieDetails = async (req, res) => {
  const { id } = req.params;

  const movie = await Movie.findByPk(id);

  if (!movie) {
    return res.status(404).json({
      error: 'Movie not found',
    });
  }

  const genres = await movie.getGenres();
  const characters = await movie.getCharacters();

  const movieCard = {
    title: movie.title,
    image: movie.image,
    score: movie.score,
    date: movie.date,
    genres: genres.map((genre) => {
      return {
        id: genre.id,
        name: genre.name,
      };
    }),
    characters: characters.map((character) => {
      return {
        id: character.id,
        name: character.name,
        image: character.image,
      };
    }),
  };

  res.status(200).json(movieCard);
};

module.exports = {
  createMovie,
  getMovies,
  updateMovie,
  removeMovie,
  getMovieDetails,
};
