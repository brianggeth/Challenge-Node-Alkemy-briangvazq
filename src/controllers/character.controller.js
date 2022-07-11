const { Character, Movie, Genre } = require('../db.js');

//#############################################################################
//Create a new character
//#############################################################################
const createCharacter = async (req, res) => {
  const { image, name, age, weight, story, movies } = req.body;

  if (
    !image.match(/^(http|https):\/\//) ||
    !image.match(/\.(jpeg|jpg|gif|png)$/)
  ) {
    return res.status(400).json({
      error: 'Image must be a valid url',
    });
  }

  if (!name || !age || !weight || !story) {
    return res.status(400).json({
      error: 'Name, age, weight and story are required',
    });
  }

  const [character, created] = await Character.findOrCreate({
    where: { name },
    defaults: { image, name, age, weight, story },
  });

  if (created) {
    res.status(201).json({ message: 'Character created' });
  } else res.status(200).json({ message: 'Character already exists' });
};

//#############################################################################
// Update a character && Add a movie to a character
//#############################################################################
const updateCharacter = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      error: 'Id is required',
    });
  }

  const { image, name, age, weight, story, movies } = req.body;

  const character = await Character.findByPk(id);

  if (!character) {
    return res.status(404).json({
      error: 'Character not found',
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

  character.update({
    image,
    name,
    age,
    weight,
    story,
  });

  if (movies) {
    for (const movie of movies) {
      const movieInstance = await Movie.findOne({
        where: { id: movie },
      });

      if (!movieInstance) {
        return res.status(400).json({
          error: 'Movie not found',
          movie,
        });
      }

      await character.addMovie(movieInstance);
    }
  }

  res.status(200).json({ message: 'Character updated' });
};

//#############################################################################
// Remove a character
//#############################################################################
const removeCharacter = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      error: 'Id is required',
    });
  }

  const character = await Character.findByPk(id);

  if (!character) {
    return res.status(404).json({
      error: 'Character not found',
    });
  }

  character.destroy();
  res.status(200).send({ msg: 'Character deleted' });
};

//#############################################################################
// Get all characters, filtered by name, age, weight and movies
//#############################################################################
const getCharacters = async (req, res) => {
  const { name, age, weight, movies } = req.query;

  let characters;
  if (name) {
    characters = await Character.findOne({
      where: { name },
    });
  }
  if (age) {
    characters = await Character.findAll({
      where: { age },
    });
  }
  if (weight) {
    characters = await Character.findAll({
      where: { weight },
    });
  }
  if (movies) {
    characters = await Character.findAll({
      include: [{ model: Movie, where: { id: movies } }],
    });
  }

  if (!name && !age && !weight && !movies) {
    characters = await Character.findAll();
  }

  if (characters.length === 0) {
    return res.status(404).json({
      error: 'Characters not found',
    });
  }

  const characterCard = characters.map((character) => {
    return {
      id: character.id,
      name: character.name,
      image: character.image,
    };
  });

  res.status(200).json(characterCard);
};

//#############################################################################
// Get a character by id
//#############################################################################

const getCharacterDetails = async (req, res) => {
  const { id } = req.params;

  const character = await Character.findByPk(id);

  if (!character) {
    return res.status(404).json({
      error: 'Character not found',
    });
  }

  const characterMovies = await character.getMovies();

  const characterCard = {
    id: character.id,
    name: character.name,
    image: character.image,
    age: character.age,
    weight: character.weight,
    story: character.story,
    movies: characterMovies.map((movie) => {
      return {
        id: movie.id,
        title: movie.title,
        image: movie.image,
      };
    }),
  };

  res.status(200).json(characterCard);
};
module.exports = {
  createCharacter,
  updateCharacter,
  removeCharacter,
  getCharacters,
  getCharacterDetails,
};
