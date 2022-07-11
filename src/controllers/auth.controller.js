const { hashSync, compareSync } = require('bcrypt');
const { User } = require('../db.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET;

//############################################################################################
// Register Method for the User
//############################################################################################
const register = async (req, res) => {
  let { name, email } = req.body;
  let password = hashSync(req.body.password, 10);

  const [user, created] = await User.findOrCreate({
    where: {
      email,
    },
    defaults: {
      name,
      email,
      password,
    },
  });

  if (created) {
    res.send({ msg: 'Usuario creado', email: user.email });
  } else {
    res.send({ msg: 'Usuario ya existe', email: user.email });
  }
};

//############################################################################################
// Login Method for the User
//############################################################################################

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const user = await User.findOne({ where: { email } });

  if (!user) {
    res.send({ msg: 'Usuario no existe' });
  } else if (!compareSync(password, user.password)) {
    res.send({ msg: 'Contraseña incorrecta' });
  } else {
    // JSON WEB TOKEN generation
    const payload = {
      email: user.email,
      password: user.password,
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });

    res.send({ msg: 'Login correcto', token: 'Bearer ' + token });
  }
};

module.exports = { login, register };
