const { Genre } = require('../db.js');

//#############################################################################
// Create a new genre
//#############################################################################

const createGenre = async (req, res) => {
  const { name, image } = req.body;

  if (!name) {
    return res.status(400).json({
      error: 'Name is required',
    });
  }

  if (
    !image.match(/^(http|https):\/\//) ||
    !image.match(/\.(jpeg|jpg|gif|png)$/)
  ) {
    return res.status(400).json({
      error: 'Image must be a valid url',
    });
  }

  const [genre, created] = await Genre.findOrCreate({
    where: { name },
    defaults: { name, image },
  });

  if (created) {
    res.status(201).json({ message: 'Genre created' });
  } else res.status(200).json({ message: 'Genre already exists' });
};

//#############################################################################
// Get all genres
//#############################################################################

const getGenres = async (req, res) => {
  const genres = await Genre.findAll();
  res.status(200).json(genres);
};

module.exports = {
  createGenre,
  getGenres,
};
