const { Router } = require('express');
const router = Router();

const {
  createCharacter,
  updateCharacter,
  removeCharacter,
  getCharacters,
  getCharacterDetails,
} = require('../controllers/character.controller.js');

router.get('/detail/:id', getCharacterDetails);
router.post('/', createCharacter);
router.put('/', updateCharacter);
router.delete('/', removeCharacter);

router.get('/', getCharacters);

module.exports = router;
