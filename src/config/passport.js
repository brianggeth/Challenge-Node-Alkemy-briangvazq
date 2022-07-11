require('dotenv').config();
const SECRET = process.env.SECRET;
const passport = require('passport');

const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {};
const { User } = require('../db.js');

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET;

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    const user = await User.findOne({ where: { email: jwt_payload.email } });

    if (!user) {
      return done(null, false);
    } else {
      return done(null, user);
    }
  })
);
