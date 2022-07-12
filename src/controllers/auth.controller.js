const { hashSync, compareSync } = require('bcrypt');
const { User } = require('../db.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.EMAIL_SEND_KEY);

//############################################################################################
// Register Method for the User
//############################################################################################
const register = async (req, res) => {
  let { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: 'Name and email are required',
    });
  }

  // Check if the email is valid with regex
  if (
    !email.match(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    )
  ) {
    return res.status(400).json({
      error: 'Email is not valid',
    });
  }

  const msg = {
    to: email,
    from: 'briangvazq@gmail.com',
    subject: 'Welcome to Disney Alkemy App',
    text: 'Your account has been created successfully, please login to continue',
  };

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
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.log(error);
    }

    res.status(201).send({ msg: 'Usuario creado', email: user.email });
  } else {
    res.send({ error: 'Usuario ya existe', email: user.email });
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
